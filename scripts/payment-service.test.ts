import assert from "node:assert/strict";
import { test } from "node:test";
import { createPaymentService, type PaymentStore, type PaymentProvider, type StoredPaymentOrder } from "../src/lib/payment-service.server";
import { ACCESS_PLANS } from "../src/lib/plans";
const owner="11111111-1111-4111-8111-111111111111",other="22222222-2222-4222-8222-222222222222",signature="a".repeat(64);
function fixture(){
 const state={stored:{environment:"live",orderId:"order_QA1",userId:owner,planId:"universe_30_days",days:30,amount:17900,currency:"INR"} as StoredPaymentOrder,
  payment:{id:"pay_QA1",order_id:"order_QA1",amount:17900,currency:"INR",status:"captured",captured:true,amount_refunded:0},
  order:{id:"order_QA1",amount:17900,currency:"INR",status:"paid",amount_paid:17900},
  calls:[] as string[],applied:[] as Array<{order:StoredPaymentOrder;paymentId:string;refunded:number}>,events:[] as unknown[],
  signatureValid:true,webhookValid:true,missingOrder:false,failRecord:false,failApply:false,failIgnored:false,collection:undefined as unknown[]|undefined};
 const provider:PaymentProvider={
  create:async input=>{state.calls.push("provider-create");const amount=ACCESS_PLANS[input.planId].prices[input.currency].amount;return{id:"order_QANew",amount,currency:input.currency,status:"created",amount_paid:0};},
  payment:async()=>{state.calls.push("provider-payment");return structuredClone(state.payment);},
  order:async()=>{state.calls.push("provider-order");return structuredClone(state.order);},
  payments:async()=>{state.calls.push("provider-payments");return{items:state.collection??[state.payment]};}};
 const store:PaymentStore={order:async(id,env)=>{state.calls.push("stored-order");return !state.missingOrder&&id===state.stored.orderId&&env===state.stored.environment?structuredClone(state.stored):null;},
  record:async order=>{state.calls.push("record-order");if(state.failRecord)throw Error("synthetic unavailable storage");state.stored=order;},
  apply:async(order,paymentId,refunded,event)=>{if(state.failApply)throw Error("synthetic unavailable storage");state.applied.push({order,paymentId,refunded});if(event)state.events.push(event);return{expiresAt:"2030-01-01T00:00:00Z",planId:order.planId,status:refunded===order.amount?"refunded":"active",duplicate:false};},
  ignored:async(_env,event)=>{if(state.failIgnored)throw Error("synthetic unavailable storage");state.events.push(event);}};
 const service=createPaymentService({mode:"live",keyId:()=>"rzp_live_SYNTHETIC_ONLY",provider,store,
  verifySignature:async()=>{state.calls.push("verify-signature");return state.signatureValid;},verifyWebhook:async()=>{state.calls.push("verify-webhook");return state.webhookValid;}});
 return{state,service};
}
const confirmation={orderId:"order_QA1",paymentId:"pay_QA1",signature};
const body=(event="payment.captured",payload:unknown={payment:{entity:{id:"pay_QA1"}}})=>JSON.stringify({event,payload});
test("checkout registers durable owner and USD price before returning an order",async()=>{
 const{state,service}=fixture();const result=await service.checkout(owner,"universe_365_days","USD");
 assert.deepEqual(state.calls,["provider-create","record-order"]);assert.equal(state.stored.amount,1699);assert.equal(state.stored.currency,"USD");assert.equal(state.stored.userId,owner);assert.equal(result.mode,"live");
});
test("checkout does not return a payable order when storage registration fails",async()=>{const f=fixture();f.state.failRecord=true;await assert.rejects(f.service.checkout(owner,"universe_30_days","INR"));assert.equal(f.state.applied.length,0);});
test("owner confirmation verifies signature and provider details before applying",async()=>{const f=fixture();await f.service.confirm(owner,confirmation);assert.deepEqual(f.state.calls,["stored-order","verify-signature","provider-payment","provider-order"]);assert.equal(f.state.applied.length,1);});
test("another user cannot confirm or recover the order and causes no provider lookup",async()=>{for(const action of ["confirm","recover"]){const f=fixture();await assert.rejects(action==="confirm"?f.service.confirm(other,confirmation):f.service.recover(other,"order_QA1"));assert.deepEqual(f.state.calls,["stored-order"]);assert.equal(f.state.applied.length,0);}});
test("invalid signatures cannot reach provider fetches or access mutation",async()=>{for(const supplied of ["invalid",signature]){const f=fixture();f.state.signatureValid=false;await assert.rejects(f.service.confirm(owner,{...confirmation,signature:supplied}));assert.ok(!f.state.calls.includes("provider-payment"));assert.equal(f.state.applied.length,0);}});
for(const [label,change] of Object.entries({"payment id":{id:"pay_OTHER"},"order ownership reference":{order_id:"order_OTHER"},"amount":{amount:1},"currency":{currency:"USD"},"captured flag":{captured:false},"uncaptured status":{status:"authorized"},"negative refund":{amount_refunded:-1},"excessive refund":{amount_refunded:17901}})){
 test(`provider ${label} mismatch fails closed`,async()=>{const f=fixture();Object.assign(f.state.payment,change);await assert.rejects(f.service.confirm(owner,confirmation));assert.equal(f.state.applied.length,0);});
}
test("unpaid orders and incorrect amount_paid never activate access",async()=>{for(const change of [{status:"created"},{amount_paid:0}]){const f=fixture();Object.assign(f.state.order,change);await assert.rejects(f.service.confirm(owner,confirmation));assert.equal(f.state.applied.length,0);}});
test("fulfilment preserves stored historical price instead of today's catalogue price",async()=>{const f=fixture();f.state.stored.amount=17800;f.state.payment.amount=17800;f.state.order.amount=17800;f.state.order.amount_paid=17800;await f.service.confirm(owner,confirmation);assert.equal(f.state.applied[0].order.amount,17800);});
test("already refunded provider state is passed atomically, never presented as active",async()=>{const f=fixture();f.state.payment.amount_refunded=17900;f.state.payment.status="refunded";const result=await f.service.confirm(owner,confirmation);assert.equal(f.state.applied[0].refunded,17900);assert.equal(result.status,"refunded");});
test("recovery re-verifies one captured payment and refuses absent or ambiguous payments",async()=>{const f=fixture();await f.service.recover(owner,"order_QA1");assert.equal(f.state.applied.length,1);for(const items of [[],[f.state.payment,f.state.payment]]){const g=fixture();g.state.collection=items;await assert.rejects(g.service.recover(owner,"order_QA1"));assert.equal(g.state.applied.length,0);}});
test("webhook mode, byte limit, signature and event id are enforced before applying",async()=>{
 for(const options of [{mode:"test" as const,raw:body(),sig:signature,id:"event_QA1"},{mode:"live" as const,raw:"x".repeat(256*1024+1),sig:signature,id:"event_QA1"},{mode:"live" as const,raw:body(),sig:"bad",id:"event_QA1"},{mode:"live" as const,raw:body(),sig:signature,id:""}]){const f=fixture();await assert.rejects(f.service.webhook(options.raw,options.sig,options.id,options.mode));assert.equal(f.state.applied.length,0);}
 const f=fixture();f.state.webhookValid=false;await assert.rejects(f.service.webhook(body(),signature,"event_QA1","live"));assert.equal(f.state.applied.length,0);
});
test("signed capture includes a SHA256 event fingerprint in atomic persistence",async()=>{const f=fixture();await f.service.webhook(body(),signature,"event_QA1","live");assert.equal(f.state.applied.length,1);assert.match((f.state.events[0] as{bodyHash:string}).bodyHash,/^[a-f0-9]{64}$/);});
test("refund and order-only notifications resolve authenticated provider state",async()=>{
 for(const [type,payload] of [["refund.processed",{refund:{entity:{payment_id:"pay_QA1"}}}],["order.paid",{order:{entity:{id:"order_QA1"}}}]] as const){const f=fixture();await f.service.webhook(body(type,payload),signature,"event_QA1","live");assert.equal(f.state.applied.length,1);}
});
test("another origin's unregistered order is acknowledged without granting access",async()=>{const f=fixture();f.state.missingOrder=true;const result=await f.service.webhook(body(),signature,"event_QA1","live");assert.deepEqual(result,{ignored:true,reason:"unregistered_order"});assert.equal(f.state.applied.length,0);assert.equal(f.state.events.length,1);});
test("failed notifications record an event but do not activate access",async()=>{const f=fixture();await f.service.webhook(body("payment.failed"),signature,"event_QA1","live");assert.equal(f.state.applied.length,0);assert.equal(f.state.events.length,1);assert.ok(!f.state.calls.includes("provider-payment"));});
test("storage failures propagate so callers/webhooks can retry rather than report success",async()=>{for(const ignored of [false,true]){const f=fixture();f.state.failApply=true;f.state.failIgnored=true;await assert.rejects(f.service.webhook(body(ignored?"payment.failed":"payment.captured"),signature,"event_QA1","live"));}});
test("malformed signed JSON and references fail without access changes",async()=>{for(const raw of ["{",body("invalid event"),body("payment.captured",{payment:{entity:{id:"/not-an-id"}}})]){const f=fixture();await assert.rejects(f.service.webhook(raw,signature,"event_QA1","live"));assert.equal(f.state.applied.length,0);}});
