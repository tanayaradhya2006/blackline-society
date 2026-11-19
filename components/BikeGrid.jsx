"use client";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import BikeCard from "./BikeCard";

export default function BikeGrid({ bikes }) {
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState("All");
  const [cat, setCat] = useState("All");
  const brands = ["All", ...new Set(bikes.map((b) => b.brand.name))];
  const cats = ["All", ...new Set(bikes.map((b) => b.category))];
  const shown = useMemo(
    () =>
      bikes.filter(
        (b) =>
          (brand === "All" || b.brand.name === brand) &&
          (cat === "All" || b.category === cat) &&
          `${b.brand.name} ${b.name}`.toLowerCase().includes(q.toLowerCase())
      ),
    [bikes, q, brand, cat]
  );
  const pill = (active) => `rounded-full px-4 py-1.5 text-sm transition ${active ? "bg-burgundy text-bone" : "bg-white/5 text-steel hover:bg-white/10"}`;

  return (
    <>
      <div className="card mt-8 space-y-4 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gunmetal" size={18} />
          <input className="input pl-10" placeholder="Search a bike, e.g. Classic, Duke, Pulsar" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {brands.map((b) => (
            <button key={b} onClick={() => setBrand(b)} className={pill(brand === b)}>
              {b}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={pill(cat === c)}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((b) => (
          <BikeCard key={b.slug} bike={b} />
        ))}
      </div>
      {!shown.length && <p className="mt-10 text-center text-gunmetal">No bikes match. Try another filter.</p>}
    </>
  );
}
