import Link from "next/link";
import { createPost } from "@/app/actions";
import { getBikes } from "@/lib/data";
import { getCurrentUser, isConfigured } from "@/lib/supabase/server";
import { TAGS } from "@/lib/constants";

export default async function NewPostPage({ searchParams }) {
  const sp = await searchParams;
  const [user, bikes] = await Promise.all([getCurrentUser(), getBikes()]);

  if (!user) {
    return (
      <div className="container-x max-w-xl pt-20 text-center">
        <h1 className="h-display text-5xl text-bone">Log in to post</h1>
        <p className="mt-2 text-steel">{isConfigured ? "You need an account to start a discussion." : "Posting is disabled in demo mode. Connect Supabase to enable it."}</p>
        <Link href="/login" className="btn-primary mt-6">
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="container-x max-w-2xl pt-12">
      <h1 className="h-display text-6xl text-bone">New post</h1>
      {sp.error && <p className="mt-4 rounded-xl bg-maroon/70 p-3 text-sm text-bone">{sp.error}</p>}
      <form action={createPost} className="card mt-6 space-y-4 p-6">
        <div>
          <label className="label">Title</label>
          <input name="title" required minLength={5} className="input" placeholder="e.g. Hunter 350 rear shock too hard, any fix?" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Bike</label>
            <select name="bike" className="input" defaultValue={sp.bike ?? ""}>
              <option value="">General / any bike</option>
              {bikes.map((b) => (
                <option key={b.slug} value={b.slug}>
                  {b.brand.name} {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Topic</label>
            <select name="tag" className="input">
              {TAGS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Details</label>
          <textarea name="body" required rows={6} className="input" placeholder="Describe the problem, kilometres done, what you already tried..." />
        </div>
        <button className="btn-primary w-full">Post to the Pit</button>
      </form>
    </div>
  );
}
