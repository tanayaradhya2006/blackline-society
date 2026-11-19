import LoginForm from "@/components/LoginForm";
import { isConfigured } from "@/lib/supabase/server";

export const metadata = { title: "Log in | Blackline Society" };

export default async function LoginPage() {
  return (
    <div className="container-x grid min-h-[70vh] place-items-center py-12">
      <div className="w-full max-w-md">
        <h1 className="h-display text-center text-6xl text-bone">Join the Society</h1>
        <p className="mt-2 text-center text-steel">Membership unlocks posting, voting, mod reviews and mechanic verification.</p>
        {isConfigured ? (
          <LoginForm />
        ) : (
          <div className="card mt-8 p-6 text-center text-sm text-steel">
            Login is off in demo mode. Add your Supabase keys to <code className="text-steel">.env.local</code> (see README) and restart the app.
          </div>
        )}
      </div>
    </div>
  );
}
