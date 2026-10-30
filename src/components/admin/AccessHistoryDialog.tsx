import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { accessHistory, changeUserAccess, type AdminAccessHistory } from "@/lib/admin-access";

const date = (value: string) => new Date(value).toLocaleString();
function localInput(value: string) {
  const d = new Date(value),
    pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
const money = (amount: string | number, currency: string) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency }).format(Number(amount) / 100);

export function AccessHistoryDialog({
  user,
  environment,
  onClose,
  onChanged,
}: {
  user: { userId: string; email: string };
  environment: "sandbox" | "live";
  onClose: () => void;
  onChanged: () => void;
}) {
  const [history, setHistory] = useState<AdminAccessHistory | null>(null),
    [error, setError] = useState(""),
    [success, setSuccess] = useState("");
  const [selected, setSelected] = useState(""),
    [action, setAction] = useState<"set_expiry" | "revoke">("set_expiry"),
    [expiry, setExpiry] = useState(""),
    [reason, setReason] = useState(""),
    [busy, setBusy] = useState(false),
    [revision, setRevision] = useState(0);
  const request = useRef<{ fingerprint: string; id: string } | null>(null),
    submitting = useRef(false);
  const passes = history?.passes.filter((pass) => pass.environment === environment) ?? [];
  useEffect(() => {
    const controller = new AbortController();
    setError("");
    setHistory(null);
    accessHistory(user.userId, controller.signal)
      .then((value) => {
        if (controller.signal.aborted) return;
        setHistory(value);
        setSelected((current) =>
          value.passes.some((pass) => pass.id === current && pass.environment === environment)
            ? current
            : (value.passes.find((pass) => pass.environment === environment)?.id ?? ""),
        );
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setError(error instanceof Error ? error.message : "History could not be loaded.");
      });
    return () => controller.abort();
  }, [user.userId, environment, revision]);
  useEffect(() => {
    const pass = history?.passes.find((pass) => pass.id === selected);
    if (pass) setExpiry(localInput(pass.expires_at));
  }, [history, selected]);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting.current) return;
    setError("");
    setSuccess("");
    const target = passes.find((pass) => pass.id === selected);
    if (!target || target.status === "refunded") {
      setError("Choose an access record that has not been refunded.");
      return;
    }
    if (reason.trim().length < 3) {
      setError("Give a short reason for this change.");
      return;
    }
    if (action === "set_expiry" && !Number.isFinite(new Date(expiry).getTime())) {
      setError("Choose a valid expiry date.");
      return;
    }
    const input = {
      userId: user.userId,
      environment,
      action,
      passId: selected,
      reason: reason.trim(),
      ...(action === "set_expiry" ? { expiresAt: new Date(expiry).toISOString() } : {}),
    };
    const fingerprint = JSON.stringify(input);
    if (request.current?.fingerprint !== fingerprint)
      request.current = { fingerprint, id: crypto.randomUUID() };
    submitting.current = true;
    setBusy(true);
    try {
      await changeUserAccess({ ...input, requestId: request.current.id });
      request.current = null;
      setSuccess(
        action === "revoke"
          ? "This access record has been revoked. Other access records remain valid."
          : "The expiry date has been updated.",
      );
      setReason("");
      setRevision((n) => n + 1);
      onChanged();
    } catch (error) {
      setError(error instanceof Error ? error.message : "This change could not be saved.");
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Access and purchase history</DialogTitle>
          <DialogDescription>
            {user.email} · {environment === "sandbox" ? "Test access" : "Live access"}
          </DialogDescription>
        </DialogHeader>
        {!history && !error && <p role="status">Loading history…</p>}
        {history && (
          <div className="space-y-7">
            <section className="space-y-3">
              <h2 className="font-semibold">Access records</h2>
              {passes.length ? (
                passes.map((pass) => (
                  <div key={pass.id} className="rounded-lg border p-3 text-sm">
                    <p className="font-medium">
                      {pass.access_days} days · {pass.status}
                    </p>
                    <p>Expires {date(pass.expires_at)}</p>
                    {pass.original_expires_at && pass.original_expires_at !== pass.expires_at && (
                      <p className="text-muted-foreground">
                        Originally {date(pass.original_expires_at)}
                      </p>
                    )}
                    {Boolean(pass.expiry_is_fixed) && (
                      <p className="text-muted-foreground">Expiry set by an administrator</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No access records in this environment.
                </p>
              )}
            </section>
            {passes.length > 0 && (
              <form onSubmit={submit} className="space-y-4 rounded-lg border p-4" aria-busy={busy}>
                <h2 className="font-semibold">Manage access</h2>
                <div className="space-y-2">
                  <Label htmlFor="managed-pass">Access record</Label>
                  <select
                    id="managed-pass"
                    className="min-h-11 w-full rounded-md border bg-background px-3 text-sm"
                    value={selected}
                    onChange={(e) => setSelected(e.target.value)}
                    disabled={busy}
                  >
                    {passes.map((pass) => (
                      <option key={pass.id} value={pass.id} disabled={pass.status === "refunded"}>
                        {pass.access_days} days · {pass.status} · {date(pass.expires_at)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="managed-action">Change</Label>
                  <select
                    id="managed-action"
                    className="min-h-11 w-full rounded-md border bg-background px-3 text-sm"
                    value={action}
                    onChange={(e) => setAction(e.target.value as typeof action)}
                    disabled={busy}
                  >
                    <option value="set_expiry">Set expiry date</option>
                    <option value="revoke">Revoke this access record</option>
                  </select>
                </div>
                {action === "set_expiry" ? (
                  <div className="space-y-2">
                    <Label htmlFor="managed-expiry">Expiry in your local time</Label>
                    <Input
                      id="managed-expiry"
                      type="datetime-local"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      required
                      disabled={busy}
                    />
                    <p className="text-xs text-muted-foreground">
                      This date will be protected from automatic refund adjustments.
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    This ends the selected access record now. Other purchases and grants remain
                    valid.
                  </p>
                )}
                <div className="space-y-2">
                  <Label htmlFor="managed-reason">Reason</Label>
                  <Textarea
                    id="managed-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    minLength={3}
                    maxLength={500}
                    required
                    disabled={busy}
                  />
                </div>
                <Button
                  type="submit"
                  variant={action === "revoke" ? "destructive" : "default"}
                  disabled={busy}
                >
                  {busy
                    ? "Saving…"
                    : action === "revoke"
                      ? "Revoke selected access"
                      : "Save expiry date"}
                </Button>
              </form>
            )}
            <section className="space-y-3">
              <h2 className="font-semibold">Payments</h2>
              {history.payments
                .filter((p) => p.environment === environment)
                .map((p) => (
                  <div key={p.payment_id} className="rounded-lg border p-3 text-sm">
                    <p>
                      {money(p.amount_minor, p.currency)} · {p.state}
                    </p>
                    <p className="text-muted-foreground">{date(p.created_at)}</p>
                    {Number(p.refunded_minor) > 0 && (
                      <p>Refunded {money(p.refunded_minor, p.currency)}</p>
                    )}
                    {Number(p.refund_unused_microseconds) > 0 && (
                      <p>
                        Unused time removed:{" "}
                        {(Number(p.refund_unused_microseconds) / 86400000000).toLocaleString(
                          undefined,
                          { maximumFractionDigits: 2 },
                        )}{" "}
                        days
                      </p>
                    )}
                  </div>
                ))}
              {!history.payments.some((p) => p.environment === environment) && (
                <p className="text-sm text-muted-foreground">
                  No payment records have been imported for this environment.
                </p>
              )}
            </section>
            <section className="space-y-3">
              <h2 className="font-semibold">Refund adjustments</h2>
              {history.refundAdjustments
                .filter((r) => r.environment === environment)
                .map((r, index) => (
                  <p key={index} className="rounded-lg border p-3 text-sm">
                    Expiry changed from {date(r.previous_expiry)} to {date(r.updated_expiry)} after
                    a refund.
                  </p>
                ))}
              {!history.refundAdjustments.some((r) => r.environment === environment) && (
                <p className="text-sm text-muted-foreground">No refund adjustments.</p>
              )}
            </section>
            <section className="space-y-3">
              <h2 className="font-semibold">Administrator changes</h2>
              {history.changes
                .filter((c) => c.environment === environment)
                .map((c) => (
                  <div key={c.request_id} className="rounded-lg border p-3 text-sm">
                    <p>
                      {c.actor_name} · {c.action.replaceAll("_", " ")} · {date(c.created_at)}
                    </p>
                    <p className="text-muted-foreground">{c.reason}</p>
                  </div>
                ))}
            </section>
          </div>
        )}
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        {success && (
          <p role="status" className="text-sm text-emerald-400">
            {success}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
