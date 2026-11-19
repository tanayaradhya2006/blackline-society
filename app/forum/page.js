import Link from "next/link";
import { MessageSquare, Plus } from "lucide-react";
import { getBikes, getPosts } from "@/lib/data";
import { getCurrentUser } from "@/lib/supabase/server";
import RoleBadge from "@/components/RoleBadge";
import VoteButton from "@/components/VoteButton";

export const metadata = { title: "Forum | Blackline Society" };
import { TAGS } from "@/lib/constants";

export default async function ForumPage({ searchParams }) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  const [posts, bikes] = await Promise.all([getPosts({ bikeSlug: sp.bike, tag: sp.tag, userId: user?.id }), getBikes()]);
  const sort = sp.sort === "new" ? "new" : "top";
  const sorted = [...posts].sort((a, b) => (sort === "top" ? b.votes - a.votes : new Date(b.created_at) - new Date(a.created_at)));
  const qs = (extra) => {
    const p = new URLSearchParams({ ...(sp.bike && { bike: sp.bike }), ...(sp.tag && { tag: sp.tag }), sort, ...extra });
    for (const [k, v] of [...p.entries()]) if (!v) p.delete(k);
    return `/forum?${p}`;
  };

  return (
    <div className="container-x pt-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="h-display text-6xl text-bone">The Pit</h1>
          <p className="text-steel">Members ask. Verified mechanics answer.</p>
        </div>
        <Link href="/forum/new" className="btn-primary">
          <Plus size={16} /> New post
        </Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-4">
        <aside className="space-y-4">
          <div className="card p-4">
            <p className="label">Sort</p>
            <div className="flex gap-2">
              {["top", "new"].map((s) => (
                <Link key={s} href={qs({ sort: s })} className={`rounded-full px-4 py-1 text-sm capitalize ${sort === s ? "bg-burgundy text-bone" : "bg-white/5 text-steel"}`}>
                  {s}
                </Link>
              ))}
            </div>
          </div>
          <div className="card p-4">
            <p className="label">Topic</p>
            <div className="flex flex-wrap gap-2">
              <Link href={qs({ tag: "" })} className={`rounded-full px-3 py-1 text-xs ${!sp.tag ? "bg-burgundy text-bone" : "bg-white/5 text-steel"}`}>
                All
              </Link>
              {TAGS.map((t) => (
                <Link key={t} href={qs({ tag: t })} className={`rounded-full px-3 py-1 text-xs ${sp.tag === t ? "bg-burgundy text-bone" : "bg-white/5 text-steel"}`}>
                  {t}
                </Link>
              ))}
            </div>
          </div>
          <div className="card p-4">
            <p className="label">Bike</p>
            <div className="flex flex-col gap-1">
              <Link href={qs({ bike: "" })} className={`rounded-lg px-2 py-1 text-sm ${!sp.bike ? "text-steel" : "text-steel hover:text-bone"}`}>
                All bikes
              </Link>
              {bikes.map((b) => (
                <Link key={b.slug} href={qs({ bike: b.slug })} className={`rounded-lg px-2 py-1 text-sm ${sp.bike === b.slug ? "text-steel" : "text-steel hover:text-bone"}`}>
                  {b.brand.name} {b.name}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        <div className="space-y-3 lg:col-span-3">
          {sorted.map((p) => (
            <div key={p.id} className="card card-hover flex gap-3 p-4">
              <VoteButton post={p} />
              <Link href={`/forum/${p.id}`} className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip bg-oxblood/60 text-steel ring-burgundy">{p.tag}</span>
                  {p.bike && <span className="chip bg-white/5 text-steel ring-white/10">{p.bike.name}</span>}
                </div>
                <h2 className="mt-2 text-lg font-semibold text-bone">{p.title}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-steel">{p.body}</p>
                <div className="mt-3 flex items-center gap-4">
                  <RoleBadge author={p.author} />
                  <span className="flex items-center gap-1 text-xs text-gunmetal">
                    <MessageSquare size={13} /> {p.comment_count}
                  </span>
                </div>
              </Link>
            </div>
          ))}
          {!sorted.length && (
            <div className="card p-10 text-center text-gunmetal">
              No posts here yet. <Link href="/forum/new" className="text-steel">Start the first one.</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
