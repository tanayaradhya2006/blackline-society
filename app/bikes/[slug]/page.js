import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowBigUp, ArrowRight, Phone, Siren, TriangleAlert } from "lucide-react";
import BikeArt from "@/components/BikeArt";
import { getBike, getIssues, getPosts } from "@/lib/data";
import { getCurrentUser, isConfigured } from "@/lib/supabase/server";
import { reportIssue, toggleIssueVote } from "@/app/actions";

const sev = {
  low: "bg-transparent text-gunmetal ring-gunmetal/50",
  medium: "bg-gunmetal/15 text-steel ring-gunmetal/60",
  high: "bg-maroon/70 text-bone ring-burgundy"
};

export default async function BikePage({ params }) {
  const { slug } = await params;
  const bike = await getBike(slug);
  if (!bike) notFound();
  const user = await getCurrentUser();
  const [issues, posts] = await Promise.all([getIssues(bike, user?.id), getPosts({ bikeSlug: slug, userId: user?.id })]);
  const specs = [
    ["Engine", `${bike.engine_cc} cc`],
    ["Power", `${bike.power_hp} hp`],
    ["Torque", `${bike.torque_nm} Nm`],
    ["Mileage", `~${bike.mileage_kmpl} km/l`],
    ["Weight", `${bike.weight_kg} kg`],
    ["Price", bike.price_range]
  ];

  return (
    <div className="container-x pt-10">
      <Link href="/bikes" className="text-sm text-gunmetal hover:text-bone">
        ← All bikes
      </Link>
      <section className="mt-4 grid items-center gap-8 md:grid-cols-2">
        <div className="animate-rise">
          <p className="text-sm font-semibold uppercase tracking-widest">
            {bike.brand.name} · {bike.category}
          </p>
          <h1 className="h-display text-7xl text-bone">{bike.name}</h1>
          <p className="mt-2 text-lg text-steel">{bike.tagline}</p>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {specs.map(([k, v]) => (
              <div key={k} className="card p-3">
                <p className="text-xs uppercase tracking-wider text-gunmetal">{k}</p>
                <p className="mt-1 font-semibold text-bone">{v}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-gunmetal/70">Specs and prices are approximate. Check the official brand website for exact figures.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/mod-lab?bike=${bike.slug}`} className="btn-primary">
              Mod this bike <ArrowRight size={16} />
            </Link>
            <Link href={`/forum/new?bike=${bike.slug}`} className="btn-ghost">
              Ask the forum
            </Link>
          </div>
        </div>
        <BikeArt category={bike.category} className="w-full animate-rise" />
      </section>

      <section className="card mt-10 flex flex-col justify-between gap-4 border-burgundy bg-gradient-to-r from-maroon/70 to-transparent p-6 md:flex-row md:items-center">
        <div className="flex items-start gap-4">
          <Siren className="mt-1 shrink-0 text-steel" size={30} />
          <div>
            <h2 className="h-display text-3xl text-bone">Broke down? {bike.brand.name} roadside assistance</h2>
            <p className="text-sm text-steel">{bike.brand.rsa_notes}</p>
          </div>
        </div>
        {bike.brand.rsa_phone ? (
          <a href={`tel:${bike.brand.rsa_phone.replace(/\s/g, "")}`} className="btn bg-burgundy text-bone hover:bg-maroon">
            <Phone size={16} /> {bike.brand.rsa_phone}
          </a>
        ) : (
          <a href={bike.brand.source_url} target="_blank" className="btn-ghost">
            Open {bike.brand.name} support
          </a>
        )}
      </section>

      <section className="mt-12 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="h-display flex items-center gap-2 text-4xl text-bone">
            <TriangleAlert className="text-steel" /> Known faults
          </h2>
          <p className="text-sm text-gunmetal">Reported by riders. Tap the arrow if you had it too.</p>
          <div className="mt-5 space-y-3">
            {issues.map((i) => (
              <div key={i.id} className="card flex gap-4 p-5">
                <form action={toggleIssueVote} className="flex flex-col items-center">
                  <input type="hidden" name="issue_id" value={i.id} />
                  <input type="hidden" name="voted" value={String(i.voted)} />
                  <input type="hidden" name="bike" value={bike.slug} />
                  <button disabled={!isConfigured} className={`rounded-lg p-1 transition hover:bg-white/10 ${i.voted ? "text-steel" : "text-gunmetal"}`}>
                    <ArrowBigUp size={26} fill={i.voted ? "currentColor" : "none"} />
                  </button>
                  <span className="text-sm font-bold text-bone">{i.votes}</span>
                </form>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-bone">{i.title}</h3>
                    <span className={`chip ${sev[i.severity]}`}>{i.severity}</span>
                  </div>
                  <p className="mt-1 text-sm text-steel">{i.description}</p>
                  {i.fix_tip && (
                    <p className="mt-2 rounded-lg bg-steel/10 px-3 py-2 text-sm text-steel">
                      <b>Fix tip:</b> {i.fix_tip}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {!issues.length && <p className="text-gunmetal">No issues reported yet. Lucky bike!</p>}
          </div>
          {user && (
            <form action={reportIssue} className="card mt-5 grid gap-3 p-5 sm:grid-cols-6">
              <input type="hidden" name="bike" value={bike.slug} />
              <input name="title" required placeholder="Report an issue, e.g. Indicator stops working" className="input sm:col-span-4" />
              <select name="severity" className="input sm:col-span-2">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <textarea name="description" placeholder="What happened?" className="input sm:col-span-6" rows={2} />
              <button className="btn-primary sm:col-span-2">Report issue</button>
            </form>
          )}
        </div>
        <aside>
          <h2 className="h-display text-4xl text-bone">From the Pit</h2>
          <div className="mt-5 space-y-3">
            {posts.slice(0, 5).map((p) => (
              <Link key={p.id} href={`/forum/${p.id}`} className="card card-hover block p-4">
                <p className="font-medium text-bone">{p.title}</p>
                <p className="mt-1 text-xs text-gunmetal">
                  {p.votes} upvotes · {p.comment_count} replies
                </p>
              </Link>
            ))}
            {!posts.length && <p className="text-sm text-gunmetal">No posts yet about this bike.</p>}
            <Link href={`/forum/new?bike=${bike.slug}`} className="btn-ghost w-full">
              Start a discussion
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
}
