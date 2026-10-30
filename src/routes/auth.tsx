import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { identity } from "@/lib/auth-client";
import { oauthReturnPath } from "@/lib/oauth-return-path";
import {
  authDestination,
  googleAuthCallback,
  readAuthNext,
  saveAuthNext,
  clearAuthNext,
} from "@/lib/auth-navigation";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => {
    const n = oauthReturnPath(s.next);
    const role = typeof s.role === "string" ? s.role : undefined;
    return { next: n === "/" ? undefined : n, role };
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
  const search = Route.useSearch();
  const next = search.next;
  const isStudentFlow = search.role === "student" || Boolean(next?.includes("/learn"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signup, setSignup] = useState(false);
  const [busy, setBusy] = useState(false);
  const [verificationNeeded, setVerificationNeeded] = useState(false);
  const leaving = useRef(false);
  const { data: identitySession } = identity.useSession();
  useEffect(() => {
    const go = () => {
      if (leaving.current) return;
      leaving.current = true;
      const target = authDestination(next, readAuthNext(), isStudentFlow);
      clearAuthNext();
      // One full navigation avoids racing React updates during sign-in.
      window.location.replace(target);
    };
    if (identitySession?.user.emailVerified) go();
  }, [navigate, next, isStudentFlow, identitySession]);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const result = signup
        ? await identity.signUp.email({
            email,
            password,
            name: email.split("@")[0],
            callbackURL: googleAuthCallback(
              window.location.origin,
              authDestination(next, undefined, isStudentFlow),
            ),
          })
        : await identity.signIn.email({ email, password });
      if (result.error) {
        if (result.error.code === "EMAIL_NOT_VERIFIED") setVerificationNeeded(true);
        toast.error(result.error.message || "Sign-in could not be completed.");
        return;
      }
      if (signup) {
        setVerificationNeeded(true);
        toast.success("Check your email to confirm your account.");
        return;
      }
      if (!leaving.current) {
        leaving.current = true;
        const target = authDestination(next, readAuthNext(), isStudentFlow);
        clearAuthNext();
        window.location.replace(target);
      }
    } catch {
      toast.error("Sign-in is temporarily unavailable. Please try again.");
    } finally {
      setBusy(false);
    }
  };
  const resendVerification = async () => {
    if (busy) return;
    if (!email.trim()) {
      toast.error("Enter your account email first.");
      return;
    }
    setBusy(true);
    try {
      const result = await identity.sendVerificationEmail({
        email,
        callbackURL: googleAuthCallback(
          window.location.origin,
          authDestination(next, undefined, isStudentFlow),
        ),
      });
      if (result.error) {
        toast.error("The verification request could not be sent. Please try again.");
        return;
      }
      toast.success("If this account needs verification, a new link will be sent to it.");
    } catch {
      toast.error("Verification is temporarily unavailable. Please try again.");
    } finally {
      setBusy(false);
    }
  };
  const google = async () => {
    if (busy || leaving.current) return;
    const destination = authDestination(next, undefined, isStudentFlow);
    saveAuthNext(destination);
    setBusy(true);
    try {
      const result = await identity.signIn.social({
        provider: "google",
        callbackURL: googleAuthCallback(window.location.origin, destination),
      });
      if (result.error) {
        toast.error(result.error.message || "Google sign-in failed. Please try again.");
        return;
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Google sign-in failed.");
    } finally {
      if (!leaving.current) setBusy(false);
    }
  };
  return (
    <PublicLayout>
      <main className="mx-auto max-w-md px-5 pb-24 pt-36">
        {isStudentFlow && (
          <div className="mb-6 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-indigo-950/30 to-slate-900/60 p-4 text-xs text-slate-300">
            <div className="flex items-center gap-2 text-cyan-300 font-bold mb-1">
              <span className="text-base">🌌</span>
              <span>Cosmic Learning Academy Student Registration</span>
            </div>
            <p className="leading-relaxed">
              Student learning is <strong>100% free forever</strong>. If you already have an Our
              Visible Universe account, you can sign in directly with the same credentials —{" "}
              <strong>never a need to create a second account</strong>.
            </p>
          </div>
        )}

        <h1 className="text-4xl font-semibold">
          {isStudentFlow
            ? signup
              ? "Create student profile"
              : "Welcome back, student"
            : signup
              ? "Create your account"
              : "Welcome back"}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {isStudentFlow
            ? "Sign in or create your free account to track verified academy achievements."
            : "Sign in to purchase or use your access pass."}
        </p>
        <Button
          onClick={google}
          disabled={busy}
          aria-busy={busy}
          variant="outline"
          className="mt-8 w-full"
        >
          Continue with Google
        </Button>
        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          OR
          <span className="h-px flex-1 bg-border" />
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="auth-email" className="sr-only">
              Email address
            </Label>
            <Input
              id="auth-email"
              type="email"
              autoComplete="email"
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
            />
          </div>
          <div>
            <Label htmlFor="auth-password" className="sr-only">
              Password
            </Label>
            <Input
              id="auth-password"
              type="password"
              autoComplete={signup ? "new-password" : "current-password"}
              maxLength={128}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              minLength={signup ? 12 : 1}
              required
            />
          </div>
          <Button disabled={busy} className="w-full">
            {busy
              ? "Please wait…"
              : signup
                ? isStudentFlow
                  ? "Create free student account"
                  : "Create account"
                : "Sign in"}
          </Button>
        </form>
        {verificationNeeded && (
          <Button
            type="button"
            variant="outline"
            className="mt-4 w-full"
            disabled={busy}
            onClick={resendVerification}
          >
            Resend verification email
          </Button>
        )}
        {!signup && (
          <p className="mt-4 text-sm">
            <Link
              to="/reset-password"
              search={{ token: undefined, error: undefined }}
              onClick={() => saveAuthNext(authDestination(next, undefined, isStudentFlow))}
              className="text-primary underline"
            >
              Forgot your password?
            </Link>
          </p>
        )}
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
