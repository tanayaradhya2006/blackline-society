import { createClient } from "@/lib/supabase/server";
import * as seed from "@/data/seed-data.mjs";

const brandBySlug = Object.fromEntries(seed.brands.map((b, i) => [b.slug, { id: i + 1, ...b }]));
const demoBikes = seed.bikes.map((b, i) => ({ id: i + 1, ...b, brand: brandBySlug[b.brand] }));
const demoParts = seed.modParts.map(({ state_notes, ...p }, i) => ({ id: i + 1, region: "India", last_checked: "2026-11-15", ...p, state_notes: state_notes ?? {} }));

// Adds `state_note` (a local rule or police note for the rider's state) to each mod part.
function withStateNote(part, stateSlug) {
  const { state_notes, mod_state_notes, ...rest } = part;
  const fromDb = mod_state_notes?.find((n) => n.state_slug === stateSlug);
  const note = fromDb ?? state_notes?.[stateSlug] ?? null;
  return { ...rest, state_note: note ? { note: note.note, source_url: note.source_url } : null };
}

function normalizeBike(b) {
  return b ? { ...b, brand: b.brand } : null;
}

export async function getBrands() {
  const sb = await createClient();
  if (!sb) return Object.values(brandBySlug);
  const { data } = await sb.from("brands").select("*").order("name");
  return data ?? [];
}

export async function getBikes() {
  const sb = await createClient();
  if (!sb) return demoBikes;
  const { data } = await sb.from("bikes").select("*, brand:brands(*)").order("name");
  return (data ?? []).map(normalizeBike);
}

// The top bikes for one state, most popular first. Falls back to every bike if the
// state has no list yet.
export async function getStateBikes(stateSlug) {
  const sb = await createClient();
  if (!sb) {
    const order = seed.stateTopBikes[stateSlug];
    if (!order?.length) return demoBikes;
    return order.map((slug) => demoBikes.find((b) => b.slug === slug)).filter(Boolean);
  }
  const { data } = await sb.from("state_bikes").select("rank, bike:bikes(*, brand:brands(*))").eq("state_slug", stateSlug).order("rank");
  const list = (data ?? []).map((r) => normalizeBike(r.bike)).filter(Boolean);
  return list.length ? list : getBikes();
}

export async function getBike(slug) {
  const sb = await createClient();
  if (!sb) return demoBikes.find((b) => b.slug === slug) ?? null;
  const { data } = await sb.from("bikes").select("*, brand:brands(*)").eq("slug", slug).maybeSingle();
  return normalizeBike(data);
}

export async function getIssues(bike, userId) {
  const sb = await createClient();
  if (!sb) {
    return seed.issues
      .filter((i) => i.bike === bike.slug)
      .map((i, idx) => ({ id: `${bike.slug}-${idx}`, ...i, votes: [14, 9, 6][idx] ?? 3, voted: false }));
  }
  const { data } = await sb.from("issues").select("*, issue_votes(user_id)").eq("bike_id", bike.id);
  return (data ?? [])
    .map((i) => ({ ...i, votes: i.issue_votes.length, voted: i.issue_votes.some((v) => v.user_id === userId) }))
    .sort((a, b) => b.votes - a.votes);
}

export async function getModParts(stateSlug) {
  const sb = await createClient();
  if (!sb) return demoParts.map((p) => withStateNote(p, stateSlug));
  const { data } = await sb.from("mod_parts").select("*, mod_state_notes(state_slug, note, source_url)").order("id");
  return (data ?? []).map((p) => withStateNote(p, stateSlug));
}

export async function getModReviews() {
  const sb = await createClient();
  if (!sb) return [];
  const { data } = await sb
    .from("mod_reviews")
    .select("*, author:profiles(username), part:mod_parts(slug), bike:bikes(slug)")
    .order("created_at", { ascending: false });
  return (data ?? []).map((r) => ({ ...r, part_slug: r.part?.slug, bike_slug: r.bike?.slug }));
}

function demoPostShape(p) {
  const bike = demoBikes.find((b) => b.slug === p.bike);
  return {
    id: p.id,
    title: p.title,
    body: p.body,
    tag: p.tag,
    created_at: "2026-11-10T10:00:00Z",
    bike: bike ? { slug: bike.slug, name: `${bike.brand.name} ${bike.name}` } : null,
    author: { username: p.author, role: p.role },
    votes: p.votes,
    voted: false,
    comment_count: p.comments.length,
    comments: p.comments.map((c, i) => ({ id: i, body: c.body, created_at: "2026-11-11T10:00:00Z", author: { username: c.author, role: c.role } }))
  };
}

export async function getPosts({ bikeSlug, tag, userId } = {}) {
  const sb = await createClient();
  if (!sb) {
    return seed.demoPosts
      .filter((p) => (!bikeSlug || p.bike === bikeSlug) && (!tag || p.tag === tag))
      .map(demoPostShape);
  }
  let query = sb
    .from("posts")
    .select("id, title, body, tag, created_at, bike:bikes(slug, name, brand:brands(name)), author:profiles(username, role), post_votes(user_id), comments(count)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (bikeSlug) {
    const { data: bike } = await sb.from("bikes").select("id").eq("slug", bikeSlug).maybeSingle();
    if (!bike) return [];
    query = query.eq("bike_id", bike.id);
  }
  if (tag) query = query.eq("tag", tag);
  const { data } = await query;
  return (data ?? []).map((p) => ({
    ...p,
    bike: p.bike ? { slug: p.bike.slug, name: `${p.bike.brand?.name ?? ""} ${p.bike.name}`.trim() } : null,
    votes: p.post_votes.length,
    voted: p.post_votes.some((v) => v.user_id === userId),
    comment_count: p.comments?.[0]?.count ?? 0
  }));
}

export async function getPost(id, userId) {
  const sb = await createClient();
  if (!sb) {
    const p = seed.demoPosts.find((x) => x.id === id);
    return p ? demoPostShape(p) : null;
  }
  const { data: p } = await sb
    .from("posts")
    .select("id, title, body, tag, created_at, bike:bikes(slug, name, brand:brands(name)), author:profiles(username, role), post_votes(user_id)")
    .eq("id", id)
    .maybeSingle();
  if (!p) return null;
  const { data: comments } = await sb
    .from("comments")
    .select("id, body, created_at, author:profiles(username, role)")
    .eq("post_id", id)
    .order("created_at");
  return {
    ...p,
    bike: p.bike ? { slug: p.bike.slug, name: `${p.bike.brand?.name ?? ""} ${p.bike.name}`.trim() } : null,
    votes: p.post_votes.length,
    voted: p.post_votes.some((v) => v.user_id === userId),
    comments: comments ?? []
  };
}

export async function getMechanics(stateSlug) {
  const sb = await createClient();
  if (!sb) return seed.mechanics.map((m, i) => ({ id: i + 1, ...m })).filter((m) => !stateSlug || m.state === stateSlug);
  let query = sb.from("mechanics").select("*").eq("status", "verified").order("created_at", { ascending: false });
  if (stateSlug) query = query.eq("state", stateSlug);
  const { data } = await query;
  return data ?? [];
}

export async function getPendingMechanics() {
  const sb = await createClient();
  if (!sb) return [];
  const { data } = await sb.from("mechanics").select("*").neq("status", "verified").order("created_at");
  return data ?? [];
}
