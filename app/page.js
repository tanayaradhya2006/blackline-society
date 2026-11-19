import { existsSync } from "node:fs";
import path from "node:path";
import Link from "next/link";
import { ArrowRight, BadgeCheck, MessageSquare, Scale, Siren, Wrench } from "lucide-react";
import BikeArt from "@/components/BikeArt";
import BikeCard from "@/components/BikeCard";
import Tach from "@/components/Tach";
import { getBikes, getBrands, getModParts, getStateBikes } from "@/lib/data";
import { buildStats } from "@/lib/mods";
import { getCurrentState } from "@/lib/current-state";

const features = [
  { no: "01", icon: Wrench, title: "Known faults", text: "What really fails on your machine, ranked by members who lived it.", href: "/bikes" },
  { no: "02", icon: Scale, title: "The Mod Lab", text: "Power, mileage, noise and the law. Before you spend a rupee.", href: "/mod-lab" },
  { no: "03", icon: MessageSquare, title: "The Pit", text: "Members ask. Google-verified mechanics answer.", href: "/forum" },
  { no: "04", icon: Siren, title: "Roadside", text: "Official 24x7 lines for every major brand.", href: "/roadside" }
];

export default async function Home() {
  const { state } = await getCurrentState();
  const [allBikes, bikes, brands, parts] = await Promise.all([getBikes(), getStateBikes(state.slug), getBrands(), getModParts(state.slug)]);
  const classic = allBikes.find((b) => b.slug === "re-classic-350") ?? bikes[0];
  const exhaust = parts.find((p) => p.slug === "aftermarket-exhaust") ?? parts[0];
  const demo = classic && exhaust ? buildStats(classic, [exhaust]) : null;
  const hasPhoto = existsSync(path.join(process.cwd(), "public", "photos", "hero.jpg"));

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        {hasPhoto && (
          <div className="absolute inset-0 -z-10">
            <img src="/photos/hero.jpg" alt="" className="h-full w-full object-cover opacity-40 grayscale-[60%]" />
            <div className="absolute inset-0 bg-gradient-to-r from-carbon via-carbon/85 to-carbon/30" />
          </div>
        )}
        <div className="container-x grid items-center gap-12 pb-20 pt-16 md:grid-cols-2 md:pt-24">
          <div className="animate-rise">
            <p className="eyebrow flex items-center gap-3">
              <span className="inline-block h-px w-10 bg-burgundy" /> Members' garage · {state.name}
            </p>
            <h1 className="h-display mt-6 text-[17vw] sm:text-8xl lg:text-[8.5rem]">
              The motor
              <br />
              <span className="text-gradient">cult.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-steel">
              A private society for riders who know their machines. Known faults, verified mechanics, and the truth about every mod: power, mileage and the law.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/mod-lab" className="btn-primary px-7 py-3.5">
                Enter the Mod Lab <ArrowRight size={16} />
              </Link>
              <Link href="/bikes" className="btn-ghost px-7 py-3.5">
                Find your machine
              </Link>
            </div>
            <dl className="mt-12 grid max-w-md grid-cols-3 border-t border-white/[0.06] pt-6">
              {[
                [String(bikes.length).padStart(2, "0"), "Machines"],
                [String(parts.length).padStart(2, "0"), "Mods audited"],
                [String(brands.length).padStart(2, "0"), "Brand lines"]
              ].map(([n, l]) => (
                <div key={l}>
                  <dt className="font-display text-4xl font-bold text-bone">{n}</dt>
                  <dd className="eyebrow mt-1 tracking-[0.2em]">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative">
            <Tach className="mx-auto w-[78%] max-w-sm drop-shadow-[0_30px_60px_rgba(58,13,21,0.6)]" />
            {!hasPhoto && <BikeArt category="Sport" className="-mt-16 w-full" glow={false} />}
          </div>
        </div>
      </section>

      <section className="container-x mt-20">
        <div className="grid gap-px border border-white/[0.06] bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <Link key={f.title} href={f.href} className="group bg-graphite p-7 transition-colors hover:bg-graphite-700">
            <div className="flex items-start justify-between">
              <f.icon className="text-gunmetal transition-colors group-hover:text-steel" size={24} strokeWidth={1.5} />
              <span className="font-mono text-[10px] text-gunmetal">{f.no}</span>
            </div>
            <h3 className="h-display mt-8 text-3xl">{f.title}</h3>
            <p className="mt-2 text-sm text-gunmetal">{f.text}</p>
            <div className="mt-6 h-px w-8 bg-burgundy transition-all duration-300 group-hover:w-16" />
          </Link>
        ))}
        </div>
      </section>

      {demo && (
        <section className="container-x mt-24">
          <div className="card relative overflow-hidden">
            <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-oxblood to-transparent" />
            <div className="relative grid items-center gap-10 p-8 md:grid-cols-2 md:p-12">
              <div>
                <p className="eyebrow">File 07 · Mod Lab</p>
                <h2 className="h-display mt-3 text-5xl md:text-6xl">What a loud pipe really costs.</h2>
                <p className="mt-4 text-steel">
                  {classic.brand.name} {classic.name}, clip-on exhaust. A whisper more power, less mileage, a lot more noise. {exhaust.state_note ? `In ${state.name}, a seized silencer.` : `In ${state.name}, not road legal.`}
                </p>
                <Link href={`/mod-lab?bike=${classic.slug}&parts=${exhaust.slug}`} className="btn-primary mt-7">
                  Run your build <ArrowRight size={16} />
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-px bg-white/[0.06]">
                {[
                  ["Power", demo.power.stock, `${demo.power.min}–${demo.power.max}`, "hp"],
                  ["Mileage", demo.mileage.stock, `${demo.mileage.min}–${demo.mileage.max}`, "km/l"],
                  ["Noise", demo.noise.stock, `${demo.noise.min}–${demo.noise.max}`, "dB"]
                ].map(([label, stock, mod, unit]) => (
                  <div key={label} className="bg-carbon p-5">
                    <p className="label">{label}</p>
                    <p className="font-mono text-xs text-gunmetal line-through">
                      {stock} {unit}
                    </p>
                    <p className="mt-1 font-display text-3xl font-bold text-bone">{mod}</p>
                    <p className="font-mono text-[10px] text-gunmetal">{unit}</p>
                  </div>
                ))}
                <div className="col-span-3 flex items-center justify-between bg-burgundy px-5 py-3 font-display text-sm font-semibold uppercase tracking-[0.16em] text-bone">
                  <span>Verdict</span>
                  <span>Not road legal · {state.name}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="container-x mt-24">
        <div className="flex items-end justify-between border-b border-white/[0.06] pb-4">
          <div>
            <p className="eyebrow">The register</p>
            <h2 className="h-display mt-2 text-5xl">Machines of {state.name}</h2>
          </div>
          <Link href="/bikes" className="font-mono text-[11px] uppercase tracking-[0.2em] text-steel hover:text-bone">
            Full register →
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {bikes.slice(0, 4).map((b) => (
            <BikeCard key={b.slug} bike={b} />
          ))}
        </div>
      </section>

      <section className="container-x mt-24">
        <div className="card brushed relative flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center">
          <span className="bolt left-3 top-3" />
          <span className="bolt right-3 top-3" />
          <span className="bolt bottom-3 left-3" />
          <span className="bolt bottom-3 right-3" />
          <div className="flex items-start gap-5">
            <BadgeCheck className="mt-1 shrink-0 text-steel" size={32} strokeWidth={1.5} />
            <div>
              <h3 className="h-display text-4xl">Run a workshop?</h3>
              <p className="mt-1 text-gunmetal">Earn the verified mark. Answer members. Get on the map.</p>
            </div>
          </div>
          <Link href="/mechanics/join" className="btn-primary">
            Apply for verification
          </Link>
        </div>
      </section>
    </>
  );
}
