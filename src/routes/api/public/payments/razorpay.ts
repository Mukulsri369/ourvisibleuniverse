import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/payments/razorpay")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const modeParam = new URL(request.url).searchParams.get("mode");
        if (modeParam !== "test" && modeParam !== "live")
          return new Response("Invalid mode", { status: 400 });
        const { PaymentRequestError } = await import("@/lib/payment-service.server");
        try {
          const { getRazorpayMode } = await import("@/lib/razorpay.server");
          if (modeParam !== getRazorpayMode()) return new Response("Webhook environment mismatch", { status: 400 });
          const { paymentWebhookBody } = await import("@/lib/payment-webhook-body.server");
          const rawBody = await paymentWebhookBody(request);
          const { paymentRuntime } = await import("@/lib/payment-runtime.server");
          await paymentRuntime().webhook(rawBody, request.headers.get("x-razorpay-signature") ?? "",
            request.headers.get("x-razorpay-event-id") ?? "", modeParam);
          return Response.json({ received: true });
        } catch (error) {
          if (error instanceof PaymentRequestError) return new Response(error.message, { status: error.status });
          // A failed durable reconciliation must remain retryable. Never log bodies or signatures.
          console.error("Payment notification requires retry");
          return new Response("Payment notification could not be processed; retry later", { status: 503 });
        }
      },
    },
  },
});
