import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseClient, supabase } from "@/integrations/supabase/client";
import {
  passwordRecoveryCallback,
  passwordRecoveryError,
  updateRecoveryPassword,
} from "@/lib/password-recovery";

export const Route = createFileRoute("/auth-reset")({
  head: () => ({
    meta: [
      { title: "Reset password — Our Visible Universe" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PasswordRecoveryPage,
});

function PasswordRecoveryPage() {
  const [loading, setLoading] = useState(true);
  const [owner, setOwner] = useState<{ id: string; email: string } | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [complete, setComplete] = useState(false);
  const [accountChanged, setAccountChanged] = useState(false);
  const errorRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);
  useEffect(() => {
    let active = true;
    let expectedId: string | undefined;
    const callbackError =
      new URLSearchParams(window.location.search).has("error") ||
      new URLSearchParams(window.location.hash.slice(1)).has("error");
    void supabase.auth
      .getUser()
      .then(({ data, error: authError }) => {
        if (!active) return;
        if (!callbackError && !authError && data.user) {
          expectedId = data.user.id;
          setOwner({ id: data.user.id, email: data.user.email ?? "your signed-in account" });
        } else if (callbackError)
          setError("This recovery link is invalid or expired. Request a new link below.");
      })
      .catch(() => {
        if (active) setError("Could not verify your session. Check your connection and reload.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      // Do not replace the form's identity underneath an in-progress password update.
      if (expectedId && session?.user.id !== expectedId && active) {
        setAccountChanged(true);
        setPassword("");
        setConfirmation("");
        setError(
          "Your account changed or you signed out. Reload this page or reopen your recovery link.",
        );
      }
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy || accountChanged) return;
    setError("");
    setNotice("");
    if (owner) {
      const invalid = passwordRecoveryError(password, confirmation);
      if (invalid) {
        setError(invalid);
        return;
      }
    }
    setBusy(true);
    try {
      if (owner) {
        const isolated = createSupabaseClient(true);
        try {
          await updateRecoveryPassword(supabase.auth, isolated.auth, owner.id, password);
        } finally {
          isolated.auth.stopAutoRefresh();
        }
        setPassword("");
        setConfirmation("");
        setComplete(true);
        setNotice(
          "Your password was updated. You can continue to the Academy or use it the next time you sign in.",
        );
      } else {
        const result = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: passwordRecoveryCallback(window.location.origin),
        });
        if (result.error) throw result.error;
        setNotice(
          "If this email has an eligible account, a recovery link has been requested. Check your inbox and spam folder, and open the link in this browser.",
        );
      }
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "The request could not be completed. Check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <PublicLayout>
      <main className="mx-auto max-w-md px-5 pb-24 pt-36">
        <h1 className="text-4xl font-semibold">Reset your password</h1>
        <p className="mt-3 break-words text-muted-foreground">
          {loading
            ? "Checking your recovery session…"
            : owner
              ? `Choose a new password for ${owner.email}.`
              : "Enter your account email to request a recovery link."}
        </p>
        {error && (
          <p
            ref={errorRef}
            tabIndex={-1}
            role="alert"
            className="mt-5 rounded-md border border-destructive p-3 text-sm text-destructive"
          >
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="mt-5 rounded-md border border-border p-3 text-sm">
            {notice}
          </p>
        )}
        {!loading && !complete && (
          <form onSubmit={submit} aria-busy={busy} className="mt-8 space-y-4">
            {owner ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="recovery-password">New password</Label>
                  <Input
                    id="recovery-password"
                    className="min-h-11"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    disabled={busy || accountChanged}
                    aria-describedby="recovery-password-help"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <p id="recovery-password-help" className="text-sm text-muted-foreground">
                    Use at least 8 characters. A longer, unique password is safer. Password managers
                    and paste are supported.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recovery-confirmation">Confirm new password</Label>
                  <Input
                    id="recovery-confirmation"
                    className="min-h-11"
                    type="password"
                    autoComplete="new-password"
                    required
                    disabled={busy || accountChanged}
                    value={confirmation}
                    onChange={(event) => setConfirmation(event.target.value)}
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="recovery-email">Account email</Label>
                <Input
                  id="recovery-email"
                  className="min-h-11"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={busy}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            )}
            <Button className="min-h-11 w-full" disabled={busy || accountChanged}>
              {busy ? "Please wait…" : owner ? "Update password" : "Send recovery link"}
            </Button>
          </form>
        )}
        <div className="mt-6 flex flex-wrap gap-x-6">
          <Link
            to="/auth"
            search={{ next: undefined, role: undefined }}
            className="inline-flex min-h-11 items-center text-sm text-primary underline"
          >
            Back to sign in
          </Link>
          {complete && (
            <Link
              to="/learn"
              className="inline-flex min-h-11 items-center text-sm text-primary underline"
            >
              Continue to Academy
            </Link>
          )}
        </div>
      </main>
    </PublicLayout>
  );
}
