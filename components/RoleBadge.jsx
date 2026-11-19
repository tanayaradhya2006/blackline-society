import { BadgeCheck } from "lucide-react";

export default function RoleBadge({ author }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-steel">
      @{author?.username ?? "rider"}
      {author?.role === "mechanic" && (
        <span className="chip bg-steel/10 text-steel ring-steel/40">
          <BadgeCheck size={12} /> Verified mechanic
        </span>
      )}
      {author?.role === "admin" && <span className="chip bg-oxblood/60 text-steel ring-burgundy">Admin</span>}
    </span>
  );
}
