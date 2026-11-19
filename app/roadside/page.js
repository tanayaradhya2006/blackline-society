import { ExternalLink, Phone, Siren, TriangleAlert } from "lucide-react";
import { getBrands } from "@/lib/data";
import { getCurrentState } from "@/lib/current-state";

export const metadata = { title: "Roadside Assistance | Blackline Society" };

export default async function RoadsidePage() {
  const { state } = await getCurrentState();
  const brands = await getBrands();
  const tips = [
    "Move yourself and the bike to the side of the road, switch on hazard lights.",
    "Keep your registration number, frame number (VIN) and location ready before calling.",
    `In an accident with injuries, call 112 (emergency) or 108 (ambulance in ${state.name}) first.`,
    "Most brand RSA plans need an active subscription. Check your RSA card or the brand app."
  ];
  return (
    <div className="container-x pt-12">
      <Siren size={44} className="text-steel" />
      <h1 className="h-display mt-2 text-6xl text-bone">Roadside assistance</h1>
      <p className="max-w-2xl text-steel">Official brand helplines for when your bike gives up on you. Tap a number to call.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {brands.map((b) => (
          <div key={b.slug} className="card card-hover relative overflow-hidden p-6">
            <div className="redline-bar absolute inset-x-0 top-0 h-[3px]" />
            <div className="flex items-center justify-between">
              <h2 className="h-display text-3xl text-bone">{b.name}</h2>
              <span className="chip bg-white/5 text-steel ring-white/10">{b.rsa_hours}</span>
            </div>
            <p className="mt-2 min-h-[60px] text-sm text-steel">{b.rsa_notes}</p>
            {b.rsa_phone ? (
              <a href={`tel:${b.rsa_phone.replace(/\s/g, "")}`} className="btn mt-4 w-full bg-burgundy text-lg text-bone hover:bg-maroon">
                <Phone size={18} /> {b.rsa_phone}
              </a>
            ) : (
              <p className="mt-4 rounded-xl bg-white/5 p-3 text-center text-sm text-steel">Use the brand app or nearest authorised service centre</p>
            )}
            {b.customer_care && b.customer_care !== b.rsa_phone && <p className="mt-2 text-center text-xs text-gunmetal">Customer care: {b.customer_care}</p>}
            <a href={b.source_url} target="_blank" className="mt-3 inline-flex items-center gap-1 text-xs text-steel hover:underline">
              Official page <ExternalLink size={11} />
            </a>
          </div>
        ))}
      </div>

      <div className="card mt-10 p-6">
        <h2 className="h-display flex items-center gap-2 text-3xl text-bone">
          <TriangleAlert className="text-steel" /> Before you call
        </h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {tips.map((t) => (
            <li key={t} className="rounded-xl bg-white/5 p-4 text-sm text-steel">
              {t}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-gunmetal/70">Numbers are collected from official brand pages and may change. Last checked November 2026.</p>
      </div>
    </div>
  );
}
