import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getMyPendingPayments, recoverRazorpayPayment } from "@/lib/razorpay.functions";

type Pending = Awaited<ReturnType<typeof getMyPendingPayments>>;
export function PaymentRecovery({ userId, onRecovered }: { userId: string | undefined; onRecovered: () => Promise<void> }) {
  const [orders, setOrders] = useState<Pending>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loadedFor, setLoadedFor] = useState<string>();
  useEffect(() => {
    let current = true;
    setOrders([]); setMessage(""); setBusy(null); setLoadedFor(undefined);
    if (userId) void getMyPendingPayments().then(rows => {
      if (current) { setOrders(rows); setLoadedFor(userId); }
    }).catch(() => { if (current) setMessage("Checkout recovery is temporarily unavailable. Contact support before paying again if you were charged."); });
    return () => { current = false; };
  }, [userId]);
  if (!userId || (loadedFor !== userId && !message)) return null;
  if (!orders.length && !message) return null;
  return <div className="mt-6 space-y-3 rounded-lg border border-border p-4">
    <h3 className="font-medium">Interrupted checkout</h3>
    <p className="text-sm text-muted-foreground">Closing checkout does not confirm whether a payment succeeded. Check a recent checkout before paying again. Only a captured payment verified by the server can activate access.</p>
    <div role="status" aria-live="polite" className="text-sm">{message}</div>
    {loadedFor === userId && orders.map(order => <div key={order.order_id} className="flex flex-wrap items-center justify-between gap-3">
      <span className="text-sm">{new Date(order.created_at).toLocaleDateString()} · {new Intl.NumberFormat(undefined, { style: "currency", currency: order.currency }).format(order.amount_minor / 100)}</span>
      <Button variant="outline" disabled={busy !== null} onClick={async () => {
        setBusy(order.order_id); setMessage("");
        try {
          const result = await recoverRazorpayPayment({ data: { orderId: order.order_id } });
          setMessage(`Payment verified. Pass status: ${result.status}.`);
          setOrders(previous => previous.filter(row => row.order_id !== order.order_id));
          await onRecovered();
        } catch (error) { setMessage(error instanceof Error ? error.message : "Recovery is unavailable. Contact support before paying again."); }
        finally { setBusy(null); }
      }}>{busy === order.order_id ? "Checking payment…" : "Check payment status"}</Button>
    </div>)}
  </div>;
}
