import Link from "next/link";
import BikeArt from "./BikeArt";

export default function BikeCard({ bike }) {
  const specs = [
    [`${bike.engine_cc}`, "cc"],
    [`${bike.power_hp}`, "hp"],
    [`~${bike.mileage_kmpl}`, "km/l"]
  ];
  return (
    <Link href={`/bikes/${bike.slug}`} className="card card-hover group block">
      <div className="relative border-b border-white/[0.06] bg-carbon px-5 pt-8">
        <span className="chip absolute left-4 top-4 text-gunmetal ring-white/10">{bike.category}</span>
        <BikeArt category={bike.category} className="w-full transition-transform duration-500 group-hover:translate-x-1" />
      </div>
      <div className="p-5">
        <p className="eyebrow tracking-[0.25em]">{bike.brand.name}</p>
        <h3 className="h-display mt-1 text-3xl">{bike.name}</h3>
        <p className="mt-1 text-sm text-gunmetal">{bike.tagline}</p>
        <div className="mt-5 grid grid-cols-3 border-t border-white/[0.06] pt-4">
          {specs.map(([v, u]) => (
            <div key={u}>
              <p className="font-display text-xl font-bold text-bone">{v}</p>
              <p className="font-mono text-[10px] uppercase text-gunmetal">{u}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="h-px w-0 bg-burgundy transition-all duration-500 group-hover:w-full" />
    </Link>
  );
}
