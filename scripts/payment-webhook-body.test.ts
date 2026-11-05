import assert from "node:assert/strict";
import { test } from "node:test";
import { paymentWebhookBody } from "../src/lib/payment-webhook-body.server";
test("raw UTF-8 body remains unchanged for HMAC verification",async()=>{const raw='{"text":"☀️"}';assert.equal(await paymentWebhookBody(new Request("https://example.test",{method:"POST",body:raw})),raw);});
test("an oversized declared body is refused before reading it",async()=>{await assert.rejects(paymentWebhookBody(new Request("https://example.test",{method:"POST",headers:{"content-length":"300000"},body:"x"})),{status:413});});
test("streamed bodies cannot bypass the byte cap with missing or forged content length",async()=>{for(const headers of [{},{"content-length":"1"}]){const stream=new ReadableStream({start(controller){controller.enqueue(new Uint8Array(150000));controller.enqueue(new Uint8Array(150000));controller.close();}});const request=new Request("https://example.test",{method:"POST",body:stream,headers,duplex:"half"} as RequestInit);await assert.rejects(paymentWebhookBody(request),{status:413});}});
test("invalid UTF-8 is rejected rather than silently changing signature bytes",async()=>{await assert.rejects(paymentWebhookBody(new Request("https://example.test",{method:"POST",body:new Uint8Array([255])})),{status:400});});
