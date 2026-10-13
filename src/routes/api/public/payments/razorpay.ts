import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const webhookSchema = z.object({
  event: z.string(),
  payload: z.object({
    payment: z.object({
      entity: z.object({ id: z.string(), order_id: z.string().nullable(), status: z.string() }),
    }),
  }),
});

export const Route = createFileRoute("/api/public/payments/razorpay")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const modeParam = new URL(request.url).searchParams.get("mode");
        if (modeParam !== "test" && modeParam !== "live")
          return new Response("Invalid mode", { status: 400 });
        const signature = request.headers.get("x-razorpay-signature") ?? "";
        const rawBody = await request.text();
        try {
          const { fulfillRazorpayPayment, verifyRazorpayWebhook } =
            await import("@/lib/razorpay.server");
          if (!(await verifyRazorpayWebhook(rawBody, signature, modeParam)))
            return new Response("Invalid signature", { status: 401 });
          const event = webhookSchema.parse(JSON.parse(rawBody));
          if (event.event === "payment.captured") {
            const payment = event.payload.payment.entity;
            if (!payment.order_id || payment.status !== "captured")
              return new Response("Invalid payment", { status: 400 });
            await fulfillRazorpayPayment({
              paymentId: payment.id,
              orderId: payment.order_id,
              mode: modeParam,
            });
          }
          return Response.json({ received: true });
        } catch (error) {
          console.error("Razorpay payment notification error", error);
          return new Response("Invalid payment notification", { status: 400 });
        }
      },
    },
  },
});
