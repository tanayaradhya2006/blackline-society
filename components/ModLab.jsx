"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CircleDot, Cpu, ExternalLink, Fan, Fuel, Lightbulb, Scale, Settings, ShieldAlert, ShieldCheck, ShieldX, Star, Volume2, Wind, Zap } from "lucide-react";
import BikeArt from "./BikeArt";
import { buildStats, legalStyle } from "@/lib/mods";
import { addModReview } from "@/app/actions";

const icons = { wind: Wind, fan: Fan, cpu: Cpu, settings: Settings, lightbulb: Lightbulb, "circle-dot": CircleDot, "volume-2": Volume2 };
const shieldFor = { legal: ShieldCheck, conditional: ShieldAlert, illegal: ShieldX };

function StatBar({ icon: Icon, label, unit, stock, min, max, scale, goodWhenUp }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(t);
  }, []);
  const mid = (min + max) / 2;
  const diff = Math.round((mid - stock) * 10) / 10;
  const better = goodWhenUp ? diff > 0 : diff < 0;
  const color = diff === 0 ? "bg-gunmetal" : better ? "bg-steel" : "bg-burgundy";
  const w = (v) => `${ready ? Math.min(100, (v / scale) * 100) : 0}%`;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="flex items-center gap-2 text-sm font-semibold text-bone">
          <Icon size={16} className="text-steel" /> {label}
        </p>
        <p className="text-sm">
          <span className="text-gunmetal">{stock}</span>
          <span className="mx-2 text-gunmetal/70">→</span>
          <span className="font-bold text-bone">{min === max ? min : `${min} to ${max}`}</span>
          <span className="ml-1 text-gunmetal">{unit}</span>
          {diff !== 0 && <span className={`ml-2 text-xs font-bold ${better ? "text-steel" : "text-steel"}`}>{diff > 0 ? `+${diff}` : diff}</span>}
        </p>
      </div>
      <div className="mt-2 space-y-1.5">
        <div className="h-2.5 overflow-hidden rounded-full bg-white/5">
          <div className="h-full rounded-full bg-gunmetal/50 transition-all duration-700" style={{ width: w(stock) }} />
        </div>
        <div className="relative h-2.5 overflow-hidden rounded-full bg-white/5">
          <div className={`h-full rounded-full ${color} transition-all duration-1000 ease-out`} style={{ width: w(max) }} />
          <div className="absolute inset-y-0 left-0 rounded-full bg-black/25 transition-all duration-1000" style={{ width: w(min) }} />
        </div>
      </div>
    </div>
  );
}

export default function ModLab({ bikes, parts, reviews, initialBike, initialParts, loggedIn, stateName }) {
  const [bikeSlug, setBikeSlug] = useState(initialBike);
  const [selected, setSelected] = useState(initialParts);
  const bike = bikes.find((b) => b.slug === bikeSlug) ?? bikes[0];
  const chosen = parts.filter((p) => selected.includes(p.slug));
  const stats = useMemo(() => buildStats(bike, chosen), [bike, chosen]);
  const status = legalStyle[stats.status];
  const Shield = shieldFor[stats.status];
  const relevantReviews = reviews.filter((r) => r.bike_slug === bike.slug && (!selected.length || selected.includes(r.part_slug)));

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("bike", bikeSlug);
    if (selected.length) url.searchParams.set("parts", selected.join(","));
    else url.searchParams.delete("parts");
    window.history.replaceState(null, "", url);
  }, [bikeSlug, selected]);

  const toggle = (slug) => setSelected((s) => (s.includes(slug) ? s.filter((x) => x !== slug) : [...s, slug]));

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-5">
      <div className="space-y-6 lg:col-span-3">
        <div className="card p-5">
          <p className="label">1. Your bike</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {bikes.map((b) => (
              <button
                key={b.slug}
                onClick={() => setBikeSlug(b.slug)}
                className={`shrink-0 rounded-xl border px-3 py-2 text-left text-sm transition ${b.slug === bike.slug ? "border-burgundy bg-oxblood/60 text-bone" : "border-white/10 text-steel hover:border-white/30"}`}
              >
                <span className="block text-[10px] uppercase tracking-wider">
                  {b.brand.name}
                </span>
                {b.name}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <p className="label">2. Stack your mods</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {parts.map((p) => {
              const Icon = icons[p.icon] ?? Settings;
              const on = selected.includes(p.slug);
              const ls = legalStyle[p.legal_status];
              return (
                <button
                  key={p.slug}
                  onClick={() => toggle(p.slug)}
                  className={`group rounded-2xl border p-4 text-left transition ${on ? "border-burgundy bg-oxblood/60 shadow-glow" : "border-white/10 bg-white/[0.02] hover:border-white/30"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={`grid h-10 w-10 place-items-center rounded-xl transition ${on ? "bg-burgundy text-bone" : "bg-white/5 text-steel"}`}>
                      <Icon size={20} />
                    </span>
                    <span className={`chip ${ls.cls}`}>{{ legal: "Legal", conditional: "Conditions", illegal: "Illegal" }[p.legal_status]}</span>
                  </div>
                  <p className="mt-3 font-semibold text-bone">{p.name}</p>
                  <p className="mt-1 text-xs text-steel">{p.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="card sticky top-24 overflow-hidden">
          <div className="bg-gradient-to-b from-graphite-700 to-graphite px-6 pt-4">
            <BikeArt category={bike.category} spin={chosen.length > 0} className="mx-auto w-4/5" />
          </div>
          <div className="space-y-5 p-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-gunmetal">Your build</p>
              <h2 className="h-display text-4xl text-bone">
                {bike.brand.name} {bike.name}
              </h2>
              <p className="text-sm text-steel">{chosen.length ? chosen.map((c) => c.name).join(" + ") : "Stock. Pick some mods to see the effect."}</p>
            </div>
            <StatBar icon={Zap} label="Power" unit="hp" stock={stats.power.stock} min={stats.power.min} max={stats.power.max} scale={bike.power_hp * 1.3} goodWhenUp />
            <StatBar icon={Fuel} label="Mileage" unit="km/l" stock={stats.mileage.stock} min={stats.mileage.min} max={stats.mileage.max} scale={bike.mileage_kmpl * 1.2} goodWhenUp />
            <StatBar icon={Volume2} label="Noise" unit="dB" stock={stats.noise.stock} min={stats.noise.min} max={stats.noise.max} scale={120} goodWhenUp={false} />

            <div className={`rounded-2xl p-4 ring-1 ${status.cls}`}>
              <p className="flex items-center gap-2 font-semibold">
                <Shield size={18} /> {status.label}
              </p>
              <p className="mt-1 text-xs opacity-80">National rules apply in {stateName}, plus any local notes below. Stock is always legal.</p>
            </div>

            {chosen.map((p) => (
              <div key={p.slug} className="rounded-xl border border-white/10 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-bone">{p.name}</p>
                  <span className={`chip ${legalStyle[p.legal_status].cls}`}>{legalStyle[p.legal_status].label}</span>
                </div>
                <p className="mt-2 text-sm text-steel">{p.legal_summary}</p>
                {p.state_note && (
                  <p className="mt-2 rounded-lg bg-maroon/40 px-3 py-2 text-sm text-bone">
                    <b>In {stateName}:</b> {p.state_note.note}
                    {p.state_note.source_url && p.state_note.source_url !== p.source_url && (
                      <a href={p.state_note.source_url} target="_blank" className="ml-1 inline-flex items-center gap-1 text-xs text-steel hover:underline">
                        Source <ExternalLink size={11} />
                      </a>
                    )}
                  </p>
                )}
                <p className="mt-2 text-xs text-gunmetal">{p.other_effects}</p>
                <p className="mt-2 flex items-start gap-1 text-xs text-gunmetal">
                  <Scale size={12} className="mt-0.5 shrink-0" /> {p.law_refs}
                </p>
                {p.source_url && (
                  <a href={p.source_url} target="_blank" className="mt-1 inline-flex items-center gap-1 text-xs text-steel hover:underline">
                    Source <ExternalLink size={11} />
                  </a>
                )}
              </div>
            ))}
            <p className="text-[11px] leading-relaxed text-gunmetal/70">
              Numbers are estimated ranges based on typical results, not dyno tests on your bike. Legal info is a summary, not legal advice. Undeclared mods can also void insurance claims.
            </p>
          </div>
        </div>
      </div>

      <div className="lg:col-span-5">
        <h2 className="h-display mt-6 text-4xl text-bone">Rider reviews</h2>
        <p className="text-sm text-gunmetal">Real numbers from riders who did these mods on a {bike.name}.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {relevantReviews.map((r) => (
            <div key={r.id} className="card p-5">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-bone">{parts.find((p) => p.slug === r.part_slug)?.name}</p>
                <span className="flex text-steel">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} fill={i < r.rating ? "currentColor" : "none"} />
                  ))}
                </span>
              </div>
              {r.mileage_before && r.mileage_after && (
                <p className="mt-1 text-sm text-steel">
                  Mileage {r.mileage_before} → {r.mileage_after} km/l
                </p>
              )}
              <p className="mt-2 text-sm text-steel">{r.comment}</p>
              <p className="mt-2 text-xs text-gunmetal">@{r.author?.username}</p>
            </div>
          ))}
          {!relevantReviews.length && <p className="text-gunmetal">No reviews yet for this combo. Be the first.</p>}
        </div>
        {loggedIn ? (
          <form action={addModReview} className="card mt-5 grid gap-3 p-5 md:grid-cols-6">
            <input type="hidden" name="bike" value={bike.slug} />
            <div className="md:col-span-2">
              <label className="label">Mod you did</label>
              <select name="part" className="input" defaultValue={selected[0] ?? parts[0]?.slug}>
                {parts.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Rating</label>
              <select name="rating" className="input" defaultValue="4">
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} ★
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">km/l before</label>
              <input name="mileage_before" type="number" step="0.1" className="input" />
            </div>
            <div>
              <label className="label">km/l after</label>
              <input name="mileage_after" type="number" step="0.1" className="input" />
            </div>
            <div className="md:col-span-6">
              <textarea name="comment" required rows={2} className="input" placeholder="How did it change your ride?" />
            </div>
            <button className="btn-primary md:col-span-2">Post review</button>
          </form>
        ) : (
          <Link href="/login" className="btn-ghost mt-5">
            Log in to add your review
          </Link>
        )}
      </div>
    </div>
  );
}
