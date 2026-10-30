import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { identity } from "@/lib/auth-client";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    token:
      typeof search.token === "string" && /^[\w-]{1,2048}$/.test(search.token)
        ? search.token
        : undefined,
    error: typeof search.error === "string" ? search.error.slice(0, 100) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Reset your password — Our Visible Universe" },
      { name: "robots", content: "noindex,nofollow" },
      { name: "referrer", content: "no-referrer" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const search = Route.useSearch();
  const [token] = useState(search.token);
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false),
    [done, setDone] = useState(false),
    [error, setError] = useState(
      search.error ? "This reset link is no longer valid. Request a new one." : "",
    );
  useEffect(() => {
    if (!token) return;
    // Keep the reset credential in component memory, away from navigation history/referrers.
    const clean = new URL(window.location.href);
    clean.searchParams.delete("token");
    window.history.replaceState(
      window.history.state,
      "",
      clean.pathname + clean.search + clean.hash,
    );
  }, [token]);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setError("");
    if (token && password !== confirmation) {
      setError("Your passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const result = token
        ? await identity.resetPassword({ token, newPassword: password })
        : await identity.requestPasswordReset({
            email,
            redirectTo: new URL("/reset-password", window.location.origin).href,
          });
      if (result.error) {
        setError(
          token
            ? "This reset link could not be used. Request a new one."
            : "Your request could not be sent. Please try again.",
        );
        return;
      }
      setPassword("");
      setConfirmation("");
      setDone(true);
    } catch {
      setError("This service is temporarily unavailable. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <PublicLayout>
      <main className="mx-auto max-w-md px-5 pb-24 pt-36">
        <h1 className="text-4xl font-semibold">
          {token ? "Choose a new password" : "Reset your password"}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {token
            ? "Use at least 12 characters. You will sign in again after saving."
            : "Enter your account email to request a secure reset link."}
        </p>
        {done ? (
          <div className="mt-8 space-y-5" role="status">
            <p>
              {token
                ? "Your password has been updated. Please sign in again."
                : "If this address has an account, a reset link will be sent to it. Check your email."}
            </p>
            <Button asChild className="w-full">
              <Link to="/auth" search={{ next: undefined, role: undefined }}>
                Back to sign in
              </Link>
            </Button>
          </div>
        ) : (
          <form className="mt-8 space-y-5" onSubmit={submit} aria-busy={busy}>
            {token ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="reset-password">New password</Label>
                  <Input
                    id="reset-password"
                    type="password"
                    autoComplete="new-password"
                    minLength={12}
                    maxLength={128}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={busy}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reset-confirmation">Confirm new password</Label>
                  <Input
                    id="reset-confirmation"
                    type="password"
                    autoComplete="new-password"
                    minLength={12}
                    maxLength={128}
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                    disabled={busy}
                    required
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email address</Label>
                <Input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={busy}
                  required
                />
              </div>
            )}
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <Button className="w-full" disabled={busy}>
              {busy ? "Please wait…" : token ? "Save new password" : "Send reset link"}
            </Button>
            {token && (
              <a href="/reset-password" className="inline-block text-sm text-primary underline">
                Request a new link
              </a>
            )}
          </form>
        )}
        <p className="mt-6 text-sm">
          <Link
            to="/auth"
            search={{ next: undefined, role: undefined }}
            className="text-primary underline"
          >
            Return to sign in
          </Link>
        </p>
      </main>
    </PublicLayout>
  );
}
