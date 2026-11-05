import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { test } from 'node:test';
import { verifyRazorpaySignature, verifyRazorpayWebhook, assertRazorpayCheckoutEnabled, createRazorpayOrder } from '../src/lib/razorpay.server';
// Deliberately synthetic values. No actual credentials, provider requests or charges.
process.env.RAZORPAY_LIVE_KEY_ID='rzp_live_SyntheticQAOnly';
process.env.RAZORPAY_LIVE_KEY_SECRET='synthetic-live-secret-for-unit-tests-only';
process.env.RAZORPAY_TEST_KEY_ID='rzp_test_SyntheticQAOnly';
process.env.RAZORPAY_TEST_KEY_SECRET='synthetic-test-secret-for-unit-tests-only';
process.env.RAZORPAY_LIVE_WEBHOOK_SECRET='synthetic-webhook-secret-for-unit-tests-only';
const sign=(secret:string,body:string)=>createHmac('sha256',secret).update(body).digest('hex');
test('Live order creation stays closed until explicitly enabled, without blocking webhook validation',async()=>{
 const previous=process.env.RAZORPAY_LIVE_CHECKOUT_ENABLED;
  const priorFetch=globalThis.fetch;let providerCalls=0;
  globalThis.fetch=async()=>{providerCalls++;throw new Error('Unexpected provider request in isolated test');};
 try{
  for(const value of [undefined,'false','TRUE','1']) {
   if(value===undefined)delete process.env.RAZORPAY_LIVE_CHECKOUT_ENABLED;else process.env.RAZORPAY_LIVE_CHECKOUT_ENABLED=value;
   assert.throws(()=>assertRazorpayCheckoutEnabled('live'));
   await assert.rejects(()=>createRazorpayOrder({planId:'universe_30_days',currency:'INR',userId:'synthetic',mode:'live'}),/not enabled/);
   assert.doesNotThrow(()=>assertRazorpayCheckoutEnabled('test'));
  }
  process.env.RAZORPAY_LIVE_CHECKOUT_ENABLED='true';assert.doesNotThrow(()=>assertRazorpayCheckoutEnabled('live'));
  assert.equal(providerCalls,0);
 }finally{globalThis.fetch=priorFetch;if(previous===undefined)delete process.env.RAZORPAY_LIVE_CHECKOUT_ENABLED;else process.env.RAZORPAY_LIVE_CHECKOUT_ENABLED=previous;}
});
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
