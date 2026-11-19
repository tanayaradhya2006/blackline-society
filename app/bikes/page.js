import BikeGrid from "@/components/BikeGrid";
import { getStateBikes } from "@/lib/data";
import { getCurrentState } from "@/lib/current-state";

export const metadata = { title: "Bikes | Blackline Society" };

export default async function BikesPage() {
  const { state } = await getCurrentState();
  const bikes = await getStateBikes(state.slug);
  return (
    <div className="container-x pt-12">
      <h1 className="h-display text-6xl text-bone">The register</h1>
      <p className="mt-2 text-steel">The most popular bikes on {state.name} roads, with specs, common issues and mod options.</p>
      <p className="mt-1 text-xs text-gunmetal/70">Most popular first, ranked by each brand's 2025 registrations in {state.name} (VAHAN, Ministry of Road Transport).</p>
      <BikeGrid bikes={bikes} />
    </div>
  );
}
