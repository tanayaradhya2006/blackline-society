import Link from "next/link";
import { BadgeCheck, MapPin, Phone, Star } from "lucide-react";
import MechanicMap from "@/components/Map";
import { getMechanics } from "@/lib/data";
import { getCurrentState } from "@/lib/current-state";

export const metadata = { title: "Verified Mechanics | Blackline Society" };

export default async function MechanicsPage({ searchParams }) {
  const sp = await searchParams;
  const { state } = await getCurrentState();
  const all = await getMechanics(state.slug);
  const cities = [...new Set(all.map((m) => m.city))].sort();
  const list = sp.city ? all.filter((m) => m.city === sp.city) : all;

  return (
    <div className="container-x pt-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="h-display text-6xl text-bone">Verified mechanics</h1>
          <p className="text-steel">Local garages checked against their Google Business listing and approved by our team.</p>
        </div>
        <Link href="/mechanics/join" className="btn-primary">
          List your garage
        </Link>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/mechanics" className={`rounded-full px-4 py-1.5 text-sm ${!sp.city ? "bg-burgundy text-bone" : "bg-white/5 text-steel"}`}>
          All {state.name}
        </Link>
        {cities.map((c) => (
          <Link key={c} href={`/mechanics?city=${encodeURIComponent(c)}`} className={`rounded-full px-4 py-1.5 text-sm ${sp.city === c ? "bg-burgundy text-bone" : "bg-white/5 text-steel"}`}>
            {c}
          </Link>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="card overflow-hidden lg:col-span-3">
          <MechanicMap key={state.slug} mechanics={list} height={480} center={state.center} zoom={state.zoom} />
        </div>
        <div className="space-y-3 lg:col-span-2">
          {list.map((m) => (
            <div key={m.id} className="card p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-bone">{m.shop_name}</h3>
                <span className="chip bg-steel/10 text-steel ring-steel/40">
                  <BadgeCheck size={12} /> Verified
                </span>
              </div>
              <p className="mt-1 flex items-center gap-1 text-sm text-steel">
                <MapPin size={14} /> {m.address || m.city}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {m.specialties?.map((s) => (
                  <span key={s} className="chip bg-white/5 text-steel ring-white/10">
                    {s}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-4 text-sm">
                {m.google_rating && (
                  <span className="flex items-center gap-1 text-steel">
                    <Star size={14} fill="currentColor" /> {m.google_rating} on Google
                  </span>
                )}
                {m.phone && (
                  <a href={`tel:${m.phone}`} className="flex items-center gap-1 text-steel hover:text-bone">
                    <Phone size={14} /> Call
                  </a>
                )}
                {m.google_maps_url && (
                  <a href={m.google_maps_url} target="_blank" className="text-steel hover:underline">
                    Directions
                  </a>
                )}
              </div>
              {m.is_demo && <p className="mt-2 text-xs text-gunmetal/70">Sample listing for the demo.</p>}
            </div>
          ))}
          {!list.length && (
            <div className="card p-5">
              <p className="text-steel">No verified mechanics in {sp.city || state.name} yet.</p>
              <Link href="/mechanics/join" className="mt-2 inline-block text-sm text-bone hover:underline">
                Run a garage here? Be the first →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
