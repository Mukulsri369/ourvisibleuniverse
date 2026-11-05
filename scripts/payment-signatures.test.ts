import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { test } from 'node:test';
import { verifyRazorpaySignature, verifyRazorpayWebhook } from '../src/lib/razorpay.server';
// Deliberately synthetic values. No actual credentials, provider requests or charges.
process.env.RAZORPAY_LIVE_KEY_ID='rzp_live_SyntheticQAOnly';
process.env.RAZORPAY_LIVE_KEY_SECRET='synthetic-live-secret-for-unit-tests-only';
process.env.RAZORPAY_TEST_KEY_ID='rzp_test_SyntheticQAOnly';
process.env.RAZORPAY_TEST_KEY_SECRET='synthetic-test-secret-for-unit-tests-only';
process.env.RAZORPAY_LIVE_WEBHOOK_SECRET='synthetic-webhook-secret-for-unit-tests-only';
const sign=(secret:string,body:string)=>createHmac('sha256',secret).update(body).digest('hex');
test('Checkout HMAC binds both stored order and payment and isolates environments',async()=>{
 const input={orderId:'order_Synthetic',paymentId:'pay_Synthetic',mode:'live' as const};
 const signature=sign(process.env.RAZORPAY_LIVE_KEY_SECRET!,`${input.orderId}|${input.paymentId}`);
 assert.equal(await verifyRazorpaySignature({...input,signature}),true);
 assert.equal(await verifyRazorpaySignature({...input,signature:signature.toUpperCase()}),true);
 assert.equal(await verifyRazorpaySignature({...input,orderId:'order_Changed',signature}),false);
 assert.equal(await verifyRazorpaySignature({...input,paymentId:'pay_Changed',signature}),false);
 assert.equal(await verifyRazorpaySignature({...input,mode:'test',signature}),false);
 assert.equal(await verifyRazorpaySignature({...input,signature:'not-a-signature'}),false);
});
test('Webhook HMAC verifies exact raw Unicode bytes and rejects reserialized or tampered JSON',async()=>{
 const body='{\r\n "event": "payment.captured", "note": "₹"\r\n}';
 const signature=sign(process.env.RAZORPAY_LIVE_WEBHOOK_SECRET!,body);
 assert.equal(await verifyRazorpayWebhook(body,signature,'live'),true);
 assert.equal(await verifyRazorpayWebhook(JSON.stringify(JSON.parse(body)),signature,'live'),false);
 assert.equal(await verifyRazorpayWebhook(body+' ',signature,'live'),false);
 assert.equal(await verifyRazorpayWebhook(body,'0'.repeat(64),'live'),false);
});
