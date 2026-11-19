import { ArrowBigUp } from "lucide-react";
import { togglePostVote } from "@/app/actions";
import { isConfigured } from "@/lib/supabase/server";

export default function VoteButton({ post }) {
  return (
    <form action={togglePostVote} className="flex w-12 shrink-0 flex-col items-center">
      <input type="hidden" name="post_id" value={post.id} />
      <input type="hidden" name="voted" value={String(post.voted)} />
      <button disabled={!isConfigured} className={`rounded-lg p-1 transition hover:bg-white/10 ${post.voted ? "text-steel" : "text-gunmetal"}`} title="Upvote">
        <ArrowBigUp size={28} fill={post.voted ? "currentColor" : "none"} />
      </button>
      <span className="text-sm font-bold text-bone">{post.votes}</span>
    </form>
  );
}
