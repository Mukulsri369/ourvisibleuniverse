import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { Currency, PlanId } from "@/lib/plans";
import { confirmRazorpayPayment, createRazorpayCheckout } from "@/lib/razorpay.functions";

type RazorpayResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RazorpayFailure = { error?: { description?: string } };
type RazorpayInstance = { open: () => void; on: (event: "payment.failed", callback: (response: RazorpayFailure) => void) => void };
type RazorpayOptions = {
  key: string; amount: number; currency: string; name: string; description: string; order_id: string;
  prefill: { email: string }; theme: { color: string }; handler: (response: RazorpayResponse) => Promise<void>;
  modal: { ondismiss: () => void };
};

declare global { interface Window { Razorpay?: new (options: RazorpayOptions) => RazorpayInstance } }

let checkoutScript: Promise<void> | undefined;
function loadCheckout() {
  if (window.Razorpay) return Promise.resolve();
  if (!checkoutScript) {
    checkoutScript = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Payment window could not be loaded"));
      document.head.appendChild(script);
    });
  }
  return checkoutScript;
}

export function RazorpayCheckout({ planId, currency, label }: { planId: PlanId; currency: Currency; label: string }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const openCheckout = async () => {
    setBusy(true);
    try {
      await loadCheckout();
      const order = await createRazorpayCheckout({ data: { planId, currency } });
      const Razorpay = window.Razorpay;
      if (!Razorpay) throw new Error("Payment window is unavailable");
      const checkout = new Razorpay({
        key: order.keyId, amount: order.amount, currency: order.currency, name: "Our Visible Universe",
        description: `${order.planName} access pass`, order_id: order.orderId,
        prefill: { email: order.customerEmail }, theme: { color: "#3b82f6" },
        handler: async response => {
          try {
            await confirmRazorpayPayment({ data: response });
            toast.success("Payment confirmed. Your universe access is active.");
            await navigate({ to: "/account" });
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Payment confirmation failed");
          } finally { setBusy(false); }
        },
        modal: { ondismiss: () => { setBusy(false); toast.info("Payment was cancelled. You have not been charged."); } },
      });
      checkout.on("payment.failed", response => { setBusy(false); toast.error(response.error?.description ?? "Payment failed. Please try again."); });
      checkout.open();
    } catch (error) {
      setBusy(false);
      toast.error(error instanceof Error ? error.message : "Checkout could not be opened");
    }
  };
  return <Button className="mt-7 w-full" onClick={openCheckout} disabled={busy}>{busy ? "Opening secure checkout…" : label}</Button>;
}