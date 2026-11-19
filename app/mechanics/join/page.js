import Link from "next/link";
import { BadgeCheck, CircleCheck } from "lucide-react";
import MechanicMap from "@/components/Map";
import { applyAsMechanic } from "@/app/actions";
import { getCurrentUser, isConfigured } from "@/lib/supabase/server";
import { getCurrentState } from "@/lib/current-state";
import { STATES } from "@/lib/states.mjs";

const steps = [
  "Sign up and fill in your garage details.",
  "We match your garage with its Google Business listing (name, address, rating).",
  "An admin reviews and approves you.",
  "You get the Verified mechanic badge on every forum answer and a pin on the map."
];

export default async function JoinPage({ searchParams }) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  const { state } = await getCurrentState();

  return (
    <div className="container-x grid gap-10 pt-12 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <BadgeCheck size={40} className="text-steel" />
        <h1 className="h-display mt-3 text-6xl text-bone">Become a verified mechanic</h1>
        <ol className="mt-6 space-y-4">
          {steps.map((s, i) => (
            <li key={s} className="flex gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-burgundy text-sm font-bold text-bone">{i + 1}</span>
              <span className="text-steel">{s}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="lg:col-span-3">
        {sp.done ? (
          <div className="card p-10 text-center">
            <CircleCheck size={48} className="mx-auto text-steel" />
            <h2 className="h-display mt-4 text-4xl text-bone">Application sent</h2>
            <p className="mt-2 text-steel">We will review your garage soon. You will get the badge once approved.</p>
            <Link href="/forum" className="btn-primary mt-6">
              Visit the forum
            </Link>
          </div>
        ) : !user ? (
          <div className="card p-10 text-center">
            <h2 className="h-display text-4xl text-bone">Log in first</h2>
            <p className="mt-2 text-steel">{isConfigured ? "Create a free account, then come back to apply." : "Applications are disabled in demo mode. Connect Supabase to enable them."}</p>
            <Link href="/login" className="btn-primary mt-6">
              Log in or sign up
            </Link>
          </div>
        ) : (
          <form action={applyAsMechanic} className="card space-y-4 p-6">
            {sp.error && <p className="rounded-xl bg-maroon/70 p-3 text-sm text-bone">{sp.error}</p>}
            <div>
              <label className="label">Garage name (as on Google)</label>
              <input name="shop_name" required className="input" placeholder="Sri Ganesh Motors" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">State</label>
                <select name="state" required className="input" defaultValue={state.slug}>
                  {STATES.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">City</label>
                <input name="city" required className="input" placeholder={state.city} />
              </div>
            </div>
            <div>
              <label className="label">Address / area</label>
              <input name="address" className="input" placeholder="12th Main, HSR Layout" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Phone</label>
                <input name="phone" className="input" placeholder="+91 ..." />
              </div>
              <div>
                <label className="label">Google Maps link</label>
                <input name="google_maps_url" type="url" className="input" placeholder="https://maps.app.goo.gl/..." />
              </div>
            </div>
            <div>
              <label className="label">Specialties (comma separated)</label>
              <input name="specialties" className="input" placeholder="Royal Enfield, KTM, Electricals" />
            </div>
            <div>
              <label className="label">Pin your garage</label>
              <MechanicMap picker height={260} center={state.center} zoom={Math.min(state.zoom + 0.5, 11)} />
            </div>
            <button className="btn-primary w-full">Submit for verification</button>
          </form>
        )}
      </div>
    </div>
  );
}
