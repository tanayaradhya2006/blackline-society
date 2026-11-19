import Link from "next/link";
import { LogOut } from "lucide-react";
import Logo from "./Logo";
import StatePicker from "./StatePicker";
import { getCurrentUser, isConfigured } from "@/lib/supabase/server";
import { getCurrentState } from "@/lib/current-state";
import { signOut } from "@/app/actions";

const links = [
  { href: "/bikes", label: "Machines" },
  { href: "/mod-lab", label: "Mod Lab" },
  { href: "/forum", label: "The Pit" },
  { href: "/mechanics", label: "Mechanics" },
  { href: "/roadside", label: "Roadside" }
];

export default async function Navbar() {
  const [user, { state, chosen }] = await Promise.all([getCurrentUser(), getCurrentState()]);
  return (
    <header className="sticky top-0 z-[1000] border-b border-white/[0.06] bg-carbon/90 backdrop-blur">
      {!isConfigured && (
        <div className="border-b border-white/[0.04] bg-oxblood py-1.5 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-steel">
          Demo mode · sample data · connect Supabase to unlock membership
        </div>
      )}
      <nav className="container-x flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="Blackline Society home">
          <Logo />
        </Link>
        <div className="hidden items-center md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="border-b-2 border-transparent px-4 py-5 font-display text-sm font-semibold uppercase tracking-[0.16em] text-steel transition-colors hover:border-burgundy hover:text-bone"
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <StatePicker current={state} mustChoose={!chosen} className="hidden sm:flex" />
          {user ? (
            <>
              {user.role === "admin" && (
                <Link href="/admin" className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-steel hover:text-bone sm:inline">
                  Admin
                </Link>
              )}
              <span className="hidden font-mono text-xs text-gunmetal sm:inline">@{user.username}</span>
              <form action={signOut}>
                <button className="btn-ghost px-3" title="Sign out">
                  <LogOut size={15} />
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="btn-primary px-4">
              Join the Society
            </Link>
          )}
        </div>
      </nav>
      <div className="flex overflow-x-auto border-t border-white/[0.04] md:hidden">
        <StatePicker current={state} variant="strip" className="sm:hidden" />
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="whitespace-nowrap px-4 py-2.5 font-display text-xs font-semibold uppercase tracking-[0.16em] text-steel hover:text-bone">
            {l.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
