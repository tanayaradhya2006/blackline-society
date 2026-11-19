"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const supabase = createClient();
    const f = new FormData(e.currentTarget);
    const email = f.get("email");
    const password = f.get("password");
    setBusy(true);
    setMsg(null);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username: f.get("username") }, emailRedirectTo: `${window.location.origin}/auth/callback` }
      });
      setBusy(false);
      if (error) return setMsg({ type: "error", text: error.message });
      if (!data.session) return setMsg({ type: "ok", text: "Check your email to confirm your account, then log in." });
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return setMsg({ type: "error", text: error.message });
    }
    router.push("/forum");
    router.refresh();
  }

  async function google() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` } });
  }

  return (
    <div className="card mt-8 p-6">
      <div className="mb-6 grid grid-cols-2 rounded-xl bg-white/5 p-1">
        {["login", "signup"].map((m) => (
          <button key={m} onClick={() => setMode(m)} className={`rounded-lg py-2 text-sm font-semibold transition ${mode === m ? "bg-burgundy text-bone" : "text-steel"}`}>
            {m === "login" ? "Log in" : "Sign up"}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="space-y-4">
        {mode === "signup" && (
          <div>
            <label className="label">Username</label>
            <input name="username" required pattern="[a-zA-Z0-9_]{3,20}" className="input" placeholder="bullet_rider" />
          </div>
        )}
        <div>
          <label className="label">Email</label>
          <input name="email" type="email" required className="input" />
        </div>
        <div>
          <label className="label">Password</label>
          <input name="password" type="password" required minLength={6} className="input" />
        </div>
        {msg && <p className={`rounded-xl p-3 text-sm ${msg.type === "error" ? "bg-maroon/70 text-bone" : "bg-steel/10 text-steel"}`}>{msg.text}</p>}
        <button disabled={busy} className="btn-primary w-full">
          {busy ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
        </button>
      </form>
      <div className="my-5 flex items-center gap-3 text-xs text-gunmetal/70">
        <span className="h-px flex-1 bg-white/10" /> or <span className="h-px flex-1 bg-white/10" />
      </div>
      <button onClick={google} className="btn-ghost w-full">
        Continue with Google
      </button>
    </div>
  );
}
