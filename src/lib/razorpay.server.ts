import { env } from "node:process";
import type { Currency, PlanId } from "@/lib/plans";
import { ACCESS_PLANS } from "@/lib/plans";

export type RazorpayMode = "test" | "live";

export type RazorpayOrder = {
  id: string;
  amount: number;
  amount_paid: number;
  currency: string;
  notes?: Record<string, string>;
  status: string;
};

export type RazorpayPayment = {
  id: string;
  amount: number;
  captured: boolean;
  currency: string;
  order_id: string;
  status: string;
  amount_refunded: number;
};

export function getRazorpayMode(): RazorpayMode {
  const mode = env.RAZORPAY_MODE ?? "test";
  if (mode !== "test" && mode !== "live") throw new Error("Invalid payment environment");
  if (mode === "live" && (env.NODE_ENV !== "production" || env.RAZORPAY_LIVE_ENABLED !== "true"))
    throw new Error("Live payments are not enabled");
  return mode;
}

export function getRazorpayConfig(mode: RazorpayMode = getRazorpayMode()) {
  const keyId = process.env[mode === "live" ? "RAZORPAY_LIVE_KEY_ID" : "RAZORPAY_TEST_KEY_ID"];
  const keySecret =
    process.env[mode === "live" ? "RAZORPAY_LIVE_KEY_SECRET" : "RAZORPAY_TEST_KEY_SECRET"];
  if (!keyId || !keySecret) throw new Error(`Razorpay ${mode} credentials are not configured`);
  if (mode === "live" && !keyId.startsWith("rzp_live_"))
    throw new Error("Razorpay live key is invalid");
  if (mode === "test" && !keyId.startsWith("rzp_test_"))
    throw new Error("Razorpay test key is invalid");
  return { keyId, keySecret, mode };
}

function authHeader(keyId: string, keySecret: string) {
  return `Basic ${btoa(`${keyId}:${keySecret}`)}`;
}

export async function razorpayRequest<T>(
  path: string,
  init: RequestInit,
  mode: RazorpayMode,
): Promise<T> {
  const { keyId, keySecret } = getRazorpayConfig(mode);
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    ...init,
    signal: AbortSignal.timeout(15000),
    headers: {
      Authorization: authHeader(keyId, keySecret),
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  const body = await response.text();
  if (!response.ok) {
    // Provider bodies can contain customer data. Report only the status.
    throw new Error(`Razorpay request failed with status ${response.status}`);
  }
  return JSON.parse(body) as T;
}

export async function createRazorpayOrder(options: {
  planId: PlanId;
  currency: Currency;
  userId: string;
  mode?: RazorpayMode;
}) {
  const mode = options.mode ?? getRazorpayMode();
  const price = ACCESS_PLANS[options.planId].prices[options.currency];
  const receipt = `ovu_${crypto.randomUUID().replaceAll("-", "").slice(0, 28)}`;
  const order = await razorpayRequest<RazorpayOrder>(
    "/orders",
    {
      method: "POST",
      body: JSON.stringify({
        amount: price.amount,
        currency: options.currency,
        receipt,
        notes: { userId: options.userId, planId: options.planId, currency: options.currency },
      }),
    },
    mode,
  );
  if (order.amount !== price.amount || order.currency !== options.currency)
    throw new Error("Razorpay returned an unexpected order");
  return order;
}

export async function verifyRazorpaySignature(options: {
  orderId: string;
  paymentId: string;
  signature: string;
  mode?: RazorpayMode;
}) {
  const mode = options.mode ?? getRazorpayMode();
  const { keySecret } = getRazorpayConfig(mode);
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(keySecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signed = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${options.orderId}|${options.paymentId}`),
  );
  const expected = Array.from(new Uint8Array(signed), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  const supplied = options.signature.toLowerCase();
  if (expected.length !== supplied.length) return false;
  let mismatch = 0;
  for (let index = 0; index < expected.length; index += 1)
    mismatch |= expected.charCodeAt(index) ^ supplied.charCodeAt(index);
  return mismatch === 0;
}

export async function verifyRazorpayWebhook(
  rawBody: string,
  signature: string,
  mode: RazorpayMode,
) {
  const secret =
    process.env[mode === "live" ? "RAZORPAY_LIVE_WEBHOOK_SECRET" : "RAZORPAY_TEST_WEBHOOK_SECRET"];
  if (!secret) throw new Error(`Razorpay ${mode} webhook secret is not configured`);
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signed = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  const expected = Array.from(new Uint8Array(signed), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  const supplied = signature.toLowerCase();
  if (expected.length !== supplied.length) return false;
  let mismatch = 0;
  for (let index = 0; index < expected.length; index += 1)
    mismatch |= expected.charCodeAt(index) ^ supplied.charCodeAt(index);
  return mismatch === 0;
}
