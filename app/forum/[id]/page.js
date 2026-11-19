import Link from "next/link";
import { notFound } from "next/navigation";
import { addComment } from "@/app/actions";
import { getPost } from "@/lib/data";
import { getCurrentUser } from "@/lib/supabase/server";
import RoleBadge from "@/components/RoleBadge";
import VoteButton from "@/components/VoteButton";

const when = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default async function PostPage({ params }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const post = await getPost(id, user?.id);
  if (!post) notFound();
  const comments = [...post.comments].sort((a, b) => (b.author?.role === "mechanic") - (a.author?.role === "mechanic"));

  return (
    <div className="container-x max-w-3xl pt-10">
      <Link href="/forum" className="text-sm text-gunmetal hover:text-bone">
        ← Back to forum
      </Link>
      <article className="card mt-4 flex gap-4 p-6">
        <VoteButton post={post} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <span className="chip bg-oxblood/60 text-steel ring-burgundy">{post.tag}</span>
            {post.bike && (
              <Link href={`/bikes/${post.bike.slug}`} className="chip bg-white/5 text-steel ring-white/10 hover:text-bone">
                {post.bike.name}
              </Link>
            )}
          </div>
          <h1 className="mt-3 text-2xl font-bold text-bone">{post.title}</h1>
          <div className="mt-2 flex items-center gap-3">
            <RoleBadge author={post.author} />
            <span className="text-xs text-gunmetal/70">{when(post.created_at)}</span>
          </div>
          <p className="mt-4 whitespace-pre-wrap text-steel">{post.body}</p>
        </div>
      </article>

      <h2 className="h-display mt-10 text-3xl text-bone">{comments.length} replies</h2>
      <p className="text-xs text-gunmetal">Answers from verified mechanics are shown first.</p>
      <div className="mt-4 space-y-3">
        {comments.map((c) => (
          <div key={c.id} className={`card p-5 ${c.author?.role === "mechanic" ? "border-steel/40" : ""}`}>
            <div className="flex items-center gap-3">
              <RoleBadge author={c.author} />
              <span className="text-xs text-gunmetal/70">{when(c.created_at)}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-steel">{c.body}</p>
          </div>
        ))}
      </div>

      {user ? (
        <form action={addComment} className="card mt-6 space-y-3 p-5">
          <input type="hidden" name="post_id" value={post.id} />
          <textarea name="body" required rows={3} className="input" placeholder="Share your answer or experience..." />
          <button className="btn-primary">Reply</button>
        </form>
      ) : (
        <Link href="/login" className="btn-ghost mt-6">
          Log in to reply
        </Link>
      )}
    </div>
  );
}
