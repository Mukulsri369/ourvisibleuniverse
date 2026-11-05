import { PaymentRequestError } from "./payment-service.server";
export async function paymentWebhookBody(request: Request, limit = 256 * 1024): Promise<string> {
  if (Number(request.headers.get("content-length")) > limit) throw new PaymentRequestError(413, "Webhook body too large");
  if (!request.body) return "";
  const reader = request.body.getReader(), parts: Uint8Array[] = [];
  let bytes = 0;
  try {
    for (;;) {
      const part = await reader.read(); if (part.done) break;
      bytes += part.value.byteLength;
      if (bytes > limit) { await reader.cancel(); throw new PaymentRequestError(413, "Webhook body too large"); }
      parts.push(part.value);
    }
  } finally { reader.releaseLock(); }
  const body = new Uint8Array(bytes); let offset = 0;
  for (const part of parts) { body.set(part, offset); offset += part.byteLength; }
  try { return new TextDecoder("utf-8", { fatal: true }).decode(body); }
  catch { throw new PaymentRequestError(400, "Invalid UTF-8 webhook body"); }
}
