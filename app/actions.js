"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { findState } from "@/lib/states.mjs";

async function requireUser() {
  const sb = await createClient();
  if (!sb) redirect("/login?demo=1");
  const { data } = await sb.auth.getUser();
  if (!data?.user) redirect("/login");
  return { sb, user: data.user };
}

async function bikeIdFromSlug(sb, slug) {
  if (!slug) return null;
  const { data } = await sb.from("bikes").select("id").eq("slug", slug).maybeSingle();
  return data?.id ?? null;
}

export async function signOut() {
  const sb = await createClient();
  if (sb) await sb.auth.signOut();
  redirect("/");
}

export async function createPost(formData) {
  const { sb, user } = await requireUser();
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const tag = String(formData.get("tag") || "Help");
  const bike_id = await bikeIdFromSlug(sb, formData.get("bike"));
  if (title.length < 5 || !body) redirect("/forum/new?error=Please add a title (5+ characters) and some details");
  const { data, error } = await sb.from("posts").insert({ user_id: user.id, title, body, tag, bike_id }).select("id").single();
  if (error) redirect(`/forum/new?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/forum");
  redirect(`/forum/${data.id}`);
}

export async function addComment(formData) {
  const { sb, user } = await requireUser();
  const post_id = String(formData.get("post_id"));
  const body = String(formData.get("body") || "").trim();
  if (body) await sb.from("comments").insert({ post_id, user_id: user.id, body });
  revalidatePath(`/forum/${post_id}`);
}

export async function togglePostVote(formData) {
  const { sb, user } = await requireUser();
  const post_id = String(formData.get("post_id"));
  const voted = formData.get("voted") === "true";
  if (voted) await sb.from("post_votes").delete().match({ post_id, user_id: user.id });
  else await sb.from("post_votes").insert({ post_id, user_id: user.id });
  revalidatePath("/forum");
  revalidatePath(`/forum/${post_id}`);
}

export async function toggleIssueVote(formData) {
  const { sb, user } = await requireUser();
  const issue_id = Number(formData.get("issue_id"));
  const voted = formData.get("voted") === "true";
  if (voted) await sb.from("issue_votes").delete().match({ issue_id, user_id: user.id });
  else await sb.from("issue_votes").insert({ issue_id, user_id: user.id });
  revalidatePath(`/bikes/${formData.get("bike")}`);
}

export async function reportIssue(formData) {
  const { sb, user } = await requireUser();
  const slug = String(formData.get("bike"));
  const bike_id = await bikeIdFromSlug(sb, slug);
  const title = String(formData.get("title") || "").trim();
  if (bike_id && title) {
    await sb.from("issues").insert({
      bike_id,
      title,
      description: String(formData.get("description") || "").trim(),
      severity: String(formData.get("severity") || "low"),
      created_by: user.id
    });
  }
  revalidatePath(`/bikes/${slug}`);
}

export async function addModReview(formData) {
  const { sb, user } = await requireUser();
  const bikeSlug = String(formData.get("bike"));
  const partSlug = String(formData.get("part"));
  const bike_id = await bikeIdFromSlug(sb, bikeSlug);
  const { data: part } = await sb.from("mod_parts").select("id").eq("slug", partSlug).maybeSingle();
  const num = (k) => (formData.get(k) ? Number(formData.get(k)) : null);
  if (bike_id && part) {
    await sb.from("mod_reviews").insert({
      bike_id,
      part_id: part.id,
      user_id: user.id,
      rating: Number(formData.get("rating") || 4),
      mileage_before: num("mileage_before"),
      mileage_after: num("mileage_after"),
      comment: String(formData.get("comment") || "").trim()
    });
  }
  revalidatePath("/mod-lab");
}

async function lookupGooglePlace(query) {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.location,places.businessStatus"
      },
      body: JSON.stringify({ textQuery: query, regionCode: "IN" })
    });
    const json = await res.json();
    const place = json.places?.[0];
    if (!place || place.businessStatus === "CLOSED_PERMANENTLY") return null;
    return place;
  } catch {
    return null;
  }
}

export async function applyAsMechanic(formData) {
  const { sb, user } = await requireUser();
  const shop_name = String(formData.get("shop_name") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const state = findState(String(formData.get("state") || ""));
  if (!shop_name || !city) redirect("/mechanics/join?error=Shop name and city are required");
  if (!state) redirect("/mechanics/join?error=Please pick your state");

  let lat = formData.get("lat") ? Number(formData.get("lat")) : null;
  let lng = formData.get("lng") ? Number(formData.get("lng")) : null;
  const place = await lookupGooglePlace(`${shop_name} ${address} ${city} ${state.name}`);
  if (place?.location && (lat === null || lng === null)) {
    lat = place.location.latitude;
    lng = place.location.longitude;
  }

  const { error } = await sb.from("mechanics").insert({
    user_id: user.id,
    shop_name,
    state: state.slug,
    city,
    address,
    phone: String(formData.get("phone") || "").trim(),
    google_maps_url: String(formData.get("google_maps_url") || "").trim(),
    specialties: String(formData.get("specialties") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    lat,
    lng,
    place_id: place?.id ?? null,
    google_rating: place?.rating ?? null,
    google_found: Boolean(place),
    status: "pending"
  });
  if (error) redirect(`/mechanics/join?error=${encodeURIComponent(error.message)}`);
  redirect("/mechanics/join?done=1");
}

export async function setMechanicStatus(formData) {
  const { sb } = await requireUser();
  await sb.rpc("set_mechanic_status", { mech_id: Number(formData.get("id")), new_status: String(formData.get("status")) });
  revalidatePath("/admin");
  revalidatePath("/mechanics");
}
