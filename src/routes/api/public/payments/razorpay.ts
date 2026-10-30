import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/api/public/payments/razorpay")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const [{ paymentService, PaymentRequestError }, { boundedRequestBody, RequestBodyError }] =
          await Promise.all([
            import("@/backend/payments.server"),
            import("@/backend/request-body.server"),
          ]);
        try {
          const mode = z
            .enum(["test", "live"])
            .parse(new URL(request.url).searchParams.get("mode"));
          await paymentService().webhook(
            await boundedRequestBody(request, 256 * 1024),
            request.headers.get("x-razorpay-signature") ?? "",
            request.headers.get("x-razorpay-event-id") ?? "",
            mode,
          );
          return Response.json({ received: true }, { headers: { "cache-control": "no-store" } });
        } catch (error) {
          if (error instanceof PaymentRequestError || error instanceof RequestBodyError)
            return new Response(error.message, { status: error.status });
          if (error instanceof z.ZodError || error instanceof SyntaxError)
            return new Response("Invalid payment notification", { status: 400 });
          // Provider/database outages stay retryable. Never log payment payloads or secrets.
          return new Response("Payment notification temporarily unavailable", { status: 503 });
        }
      },
    },
  },
});
