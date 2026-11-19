import "@fontsource/barlow-condensed/500.css";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource/barlow-condensed/800.css";
import "@fontsource/barlow/400.css";
import "@fontsource/barlow/500.css";
import "@fontsource/barlow/600.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Logo from "@/components/Logo";

export const metadata = {
  title: "Blackline Society | The motor cult.",
  description: "A private motorcycle society for South India riders. Machines, known faults, legal mods, verified mechanics and roadside help."
};

export const viewport = { themeColor: "#080808" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Navbar />
        <main>{children}</main>
        <footer className="mt-28 border-t border-white/[0.06]">
          <div className="redline-bar h-px" />
          <div className="container-x grid gap-8 py-12 md:grid-cols-3">
            <div>
              <Logo />
              <p className="mt-4 font-display text-lg font-semibold uppercase tracking-[0.18em] text-gunmetal">The motor cult.</p>
            </div>
            <p className="text-sm text-gunmetal">
              Mod figures are estimates. Legal information is a summary, not legal advice. Check with your RTO before modifying your machine.
            </p>
            <div className="flex flex-col gap-2 font-mono text-[11px] uppercase tracking-[0.2em] md:items-end">
              <Link href="/roadside" className="text-steel hover:text-bone">Roadside assistance</Link>
              <Link href="/mechanics/join" className="text-steel hover:text-bone">For mechanics</Link>
              <span className="text-gunmetal/70">Est. South India · 2026</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
