import { redirect } from "next/navigation";
import { CircleCheck, ExternalLink, ShieldX } from "lucide-react";
import { setMechanicStatus } from "@/app/actions";
import { getPendingMechanics } from "@/lib/data";
import { getCurrentUser } from "@/lib/supabase/server";
import { findState } from "@/lib/states.mjs";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (user?.role !== "admin") redirect("/");
  const pending = await getPendingMechanics();

  return (
    <div className="container-x pt-12">
      <h1 className="h-display text-6xl text-bone">Mechanic approvals</h1>
      <p className="text-steel">Check each garage against Google before approving.</p>
      <div className="mt-8 space-y-4">
        {pending.map((m) => (
          <div key={m.id} className="card flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-bone">{m.shop_name}</h2>
                <span className={`chip ${m.status === "rejected" ? "bg-maroon/70 text-bone ring-burgundy" : "bg-gunmetal/15 text-steel ring-gunmetal/60"}`}>{m.status}</span>
              </div>
              <p className="text-sm text-steel">
                {m.address}, {m.city}{findState(m.state) ? `, ${findState(m.state).name}` : ""} · {m.phone}
              </p>
              <p className={`mt-1 text-sm ${m.google_found ? "text-steel" : "text-steel"}`}>
                {m.google_found ? `Found on Google${m.google_rating ? ` (rating ${m.google_rating})` : ""}` : "Not matched on Google automatically. Check the Maps link by hand."}
              </p>
              {m.google_maps_url && (
                <a href={m.google_maps_url} target="_blank" className="inline-flex items-center gap-1 text-xs text-steel hover:underline">
                  Open Google Maps link <ExternalLink size={11} />
                </a>
              )}
            </div>
            <div className="flex gap-2">
              {[
                ["verified", "Approve", CircleCheck, "btn-primary"],
                ["rejected", "Reject", ShieldX, "btn-ghost"]
              ].map(([status, label, Icon, cls]) => (
                <form key={status} action={setMechanicStatus}>
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="status" value={status} />
                  <button className={cls}>
                    <Icon size={16} /> {label}
                  </button>
                </form>
              ))}
            </div>
          </div>
        ))}
        {!pending.length && <p className="text-gunmetal">No applications waiting.</p>}
      </div>
    </div>
  );
}
