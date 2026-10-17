import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { oauthReturnPath } from "@/lib/oauth-return-path";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => {
    const n = oauthReturnPath(s.next);
    return { next: n === "/" ? undefined : n };
  },
  head: () => ({
    meta: [
      { title: "Sign in — Our Visible Universe" },
      {
        name: "description",
        content: "Sign in to purchase or use your Our Visible Universe access pass.",
      },
      { property: "og:title", content: "Sign in — Our Visible Universe" },
      {
        property: "og:description",
        content: "Sign in to purchase or use your Our Visible Universe access pass.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});
function AuthPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signup, setSignup] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const go = () => {
      const target = next ?? sessionStorage.getItem("auth_next") ?? undefined;
      sessionStorage.removeItem("auth_next");
      void (target ? navigate({ href: target }) : navigate({ to: "/universe" }));
    };
    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) go();
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) go();
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate, next]);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const result = signup
      ? await supabase.auth.signUp({
          email,
          password,
          options: next
            ? { emailRedirectTo: new URL(next, window.location.origin).href }
            : undefined,
        })
      : await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (result.error) {
      toast.error(result.error.message);
      return;
    }
    if (signup && !result.data.session) {
      toast.success("Check your email to confirm your account.");
      return;
    }
    if (next) await navigate({ href: next });
    else await navigate({ to: "/universe" });
  };
  const google = async () => {
    if (next) sessionStorage.setItem("auth_next", next);
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/auth",
      });
      if (result.error) {
        toast.error(result.error.message || "Google sign-in failed. Please try again.");
        return;
      }
      if (result.redirected) return;
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast.error("Google sign-in didn't finish. Please try again.");
        return;
      }
      const saved = next ?? sessionStorage.getItem("auth_next") ?? "/universe";
      sessionStorage.removeItem("auth_next");
      toast.success("Signed in");
      // Full navigation guarantees the protected area sees the fresh session.
      window.location.assign(saved);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Google sign-in failed.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <PublicLayout>
      <main className="mx-auto max-w-md px-5 pb-24 pt-36">
        <h1 className="text-4xl font-semibold">
          {signup ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-3 text-muted-foreground">Sign in to purchase or use your access pass.</p>
        <Button onClick={google} variant="outline" className="mt-8 w-full">
          Continue with Google
        </Button>
        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          OR
          <span className="h-px flex-1 bg-border" />
        </div>
        <form onSubmit={submit} className="space-y-4">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
          />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            minLength={8}
            required
          />
          <Button disabled={busy} className="w-full">
            {busy ? "Please wait…" : signup ? "Create account" : "Sign in"}
          </Button>
        </form>
        <button onClick={() => setSignup((v) => !v)} className="mt-6 text-sm text-primary">
          {signup ? "Already registered? Sign in" : "New here? Create an account"}
        </button>
        <p className="mt-8 text-xs text-muted-foreground">
          By continuing, you agree to our{" "}
          <Link to="/terms" className="underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="underline">
            Privacy Policy
          </Link>
          .
        </p>
      </main>
    </PublicLayout>
  );
}
