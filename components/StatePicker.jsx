"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { LocateFixed, MapPin, X } from "lucide-react";
import { STATES, STATE_COOKIE, stateFromCoords } from "@/lib/states.mjs";

const messages = {
  locating: "Finding you...",
  outside: "Looks like you are outside South India. We only cover these states for now, pick the one you ride in.",
  denied: "Location is turned off for this site. Pick your state below instead.",
  error: "Could not get your location. Pick your state below instead.",
  unsupported: "This browser cannot share your location. Pick your state below instead."
};

// The "Find your state" screen, plus the small state button in the top bar that reopens it.
// `mustChoose` is true on a first visit: the screen opens straight away and cannot be closed
// until a state is picked.
// `variant="strip"` is the version shown in the phone-only row of links under the logo.
export default function StatePicker({ current, mustChoose = false, variant = "pill", className = "" }) {
  const router = useRouter();
  const [open, setOpen] = useState(mustChoose);
  const [status, setStatus] = useState("idle");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function choose(slug) {
    document.cookie = `${STATE_COOKIE}=${slug}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    setOpen(false);
    setStatus("idle");
    router.refresh();
  }

  function locate() {
    if (!navigator.geolocation) return setStatus("unsupported");
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const found = stateFromCoords(pos.coords.latitude, pos.coords.longitude);
        if (found) choose(found.slug);
        else setStatus("outside");
      },
      (err) => setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "error"),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10 * 60 * 1000 }
    );
  }

  const pill = (active) =>
    `rounded-full px-4 py-2 text-sm transition ${active ? "bg-burgundy text-bone" : "bg-white/5 text-steel hover:bg-white/10 hover:text-bone"}`;

  const screen = (
    <div className="fixed inset-0 z-[3000] grid place-items-center overflow-y-auto bg-carbon/95 p-4 backdrop-blur" role="dialog" aria-modal="true" aria-labelledby="state-picker-title">
      <div className="card relative w-full max-w-lg overflow-hidden p-7 sm:p-9">
        <div className="redline-bar absolute inset-x-0 top-0 h-[3px]" />
        {!mustChoose && (
          <button onClick={() => setOpen(false)} className="absolute right-4 top-4 rounded-lg p-1 text-gunmetal hover:text-bone" aria-label="Close">
            <X size={18} />
          </button>
        )}
        <p className="eyebrow flex items-center gap-3">
          <span className="inline-block h-px w-10 bg-burgundy" /> Members' garage · South India
        </p>
        <h2 id="state-picker-title" className="h-display mt-4 text-5xl sm:text-6xl">
          Find your state
        </h2>
        <p className="mt-3 text-steel">We show the top bikes, local rules, mechanics and helplines for the state you ride in.</p>

        <button onClick={locate}disabled={status === "locating"} className="btn-primary mt-7 w-full py-3.5">
          <LocateFixed size={16} /> {status === "locating" ? messages.locating : "Use my location"}
        </button>
        {status !== "idle" && status !== "locating" && <p className="mt-3 rounded-xl bg-maroon/60 p-3 text-sm text-bone">{messages[status]}</p>}

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-white/[0.08]" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-gunmetal">or pick your state</span>
          <span className="h-px flex-1 bg-white/[0.08]" />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATES.map((s) => (
            <button key={s.slug} onClick={() => choose(s.slug)} className={pill(!mustChoose && current?.slug === s.slug)}>
              {s.name}
            </button>
          ))}
        </div>
        <p className="mt-6 text-xs text-gunmetal/80">Your exact location stays on your device. We only remember the state you pick.</p>
      </div>
    </div>
  );

  if (variant === "strip") {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap border-r border-white/[0.06] px-4 py-2.5 font-display text-xs font-semibold uppercase tracking-[0.16em] text-bone ${className}`}
          aria-label={`Your state: ${current?.name}. Change`}
        >
          <MapPin size={13} className="text-steel" /> {current?.name}
        </button>
        {mounted && open && createPortal(screen, document.body)}
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`${className} flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-white/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-steel transition-colors hover:border-burgundy hover:text-bone`}
        title={`${current?.name}: change your state`}
        aria-label={`Your state: ${current?.name}. Change`}
      >
        <MapPin size={13} />
        <span className="max-w-[9rem] truncate md:hidden xl:inline">{current?.name}</span>
        <span className="hidden text-gunmetal 2xl:inline">· Change</span>
      </button>
      {mounted && open && createPortal(screen, document.body)}
    </>
  );
}
