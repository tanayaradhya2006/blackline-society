import ModLab from "@/components/ModLab";
import { getBike, getModParts, getModReviews, getStateBikes } from "@/lib/data";
import { getCurrentUser } from "@/lib/supabase/server";
import { getCurrentState } from "@/lib/current-state";

export const metadata = { title: "Mod Lab | Blackline Society" };

export default async function ModLabPage({ searchParams }) {
  const sp = await searchParams;
  const { state } = await getCurrentState();
  const [stateBikes, parts, reviews, user] = await Promise.all([getStateBikes(state.slug), getModParts(state.slug), getModReviews(), getCurrentUser()]);
  // If a link asks for a bike that is not in this state's top list, still show it.
  let bikes = stateBikes;
  if (sp.bike && !bikes.some((b) => b.slug === sp.bike)) {
    const extra = await getBike(sp.bike);
    if (extra) bikes = [...bikes, extra];
  }
  const initialBike = bikes.find((b) => b.slug === sp.bike)?.slug ?? bikes[0]?.slug;
  const initialParts = String(sp.parts || "")
    .split(",")
    .filter((s) => parts.some((p) => p.slug === s));

  return (
    <div className="container-x pt-12">
      <p className="text-sm font-semibold uppercase tracking-widest text-steel">Mod Lab · {state.name}, India</p>
      <h1 className="h-display text-6xl text-bone sm:text-7xl">Build it. Check it. Ride it legal.</h1>
      <p className="mt-2 max-w-2xl text-steel">
        Pick your bike and stack up mods. See how power, mileage and noise change, and whether the build keeps you on the right side of the law.
      </p>
      <ModLab key={state.slug} bikes={bikes} parts={parts} reviews={reviews} initialBike={initialBike} initialParts={initialParts} loggedIn={Boolean(user)} stateName={state.name} />
    </div>
  );
}
