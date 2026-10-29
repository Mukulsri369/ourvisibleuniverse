import assert from 'node:assert/strict';
import { randomUUID, createHmac } from 'node:crypto';
import { test, after } from 'node:test';
import { database, closeDatabase } from '../src/backend/db.server';
import { paymentService, paymentMode, type PaymentProvider } from '../src/backend/payments.server';
import { ACCESS_PLANS, isPlanId } from '../src/lib/plans';
import type { RazorpayOrder, RazorpayPayment } from '../src/lib/razorpay.server';
import { getAccess } from '../src/backend/access.server';

assert.equal(process.env.DB_HOST,'127.0.0.1');assert.equal(process.env.DB_PORT,'3307');assert.equal(process.env.DB_NAME,'ovu_main');
// Synthetic private keys only. This suite never sends a request to Razorpay.
process.env.RAZORPAY_MODE='test';process.env.RAZORPAY_TEST_KEY_ID='rzp_test_synthetic';
process.env.RAZORPAY_TEST_KEY_SECRET=randomUUID();process.env.RAZORPAY_TEST_WEBHOOK_SECRET=randomUUID();
const orders=new Map<string,RazorpayOrder>(),payments=new Map<string,RazorpayPayment>(),users:string[]=[];
let reads=0;
const fake:PaymentProvider={
  async create({planId,currency}){const order={id:'order_'+randomUUID().replaceAll('-',''),amount:ACCESS_PLANS[planId].prices[currency].amount,amount_paid:0,currency,status:'created'};orders.set(order.id,order);return order;},
  async payment(id){reads++;return {...payments.get(id)!};},
  async order(id){reads++;return {...orders.get(id)!};},
  async payments(id){reads++;return {items:[...payments.values()].filter(p=>p.order_id===id)};},
};
const service=paymentService(fake);
async function user(){const id=randomUUID();users.push(id);await database().execute('INSERT INTO auth_user(id,name,email,emailVerified) VALUES(?,?,?,true)',[id,'Synthetic Payment Test',id+'@example.test']);return id;}
async function fixture(){
  const userId=await user();const checkout=await service.checkout(userId,'universe_30_days','INR');
  const order=orders.get(checkout.orderId)!;order.status='paid';order.amount_paid=order.amount;
  const payment:RazorpayPayment={id:'pay_'+randomUUID().replaceAll('-',''),order_id:order.id,amount:order.amount,currency:order.currency,captured:true,status:'captured',amount_refunded:0};payments.set(payment.id,payment);
  const signature=createHmac('sha256',process.env.RAZORPAY_TEST_KEY_SECRET!).update(order.id+'|'+payment.id).digest('hex');
  return {userId,order,payment,input:{orderId:order.id,paymentId:payment.id,signature}};
}
function event(type:string,payment:RazorpayPayment){
  const raw=JSON.stringify({event:type,payload:type==='refund.processed'?{refund:{entity:{payment_id:payment.id}}}:{payment:{entity:{id:payment.id,order_id:payment.order_id}}}});
  return {raw,signature:createHmac('sha256',process.env.RAZORPAY_TEST_WEBHOOK_SECRET!).update(raw).digest('hex'),id:'evt_migration_test_'+randomUUID().replaceAll('-','')};
}
after(async()=>{
  for(const id of users){
    await database().execute('DELETE FROM payment_transactions WHERE user_id=?',[id]);
    await database().execute('DELETE FROM payment_orders WHERE user_id=?',[id]);
    await database().execute('DELETE FROM access_passes WHERE user_id=?',[id]);
    await database().execute('DELETE FROM entitlement_locks WHERE user_id=?',[id]);
    await database().execute('DELETE FROM auth_user WHERE id=?',[id]);
  }
  await database().execute("DELETE FROM payment_events WHERE event_id LIKE 'evt_migration_test_%'");
  await closeDatabase();
});

test('checkout persists ownership and amount before return; confirmation validates HMAC and provider state',async()=>{
  const f=await fixture(),other=await user();
  assert.equal(isPlanId('__proto__'),false);
  const [rows]:any=await database().execute('SELECT user_id,amount_minor,state FROM payment_orders WHERE order_id=?',[f.order.id]);
  assert.equal(rows[0].user_id,f.userId);assert.equal(Number(rows[0].amount_minor),17900);assert.equal(rows[0].state,'created');
  const before=reads;
  await assert.rejects(service.confirm(other,f.input),/not found/);
  await assert.rejects(service.confirm(f.userId,{...f.input,signature:'0'.repeat(64)}),/signature/);assert.equal(reads,before);
  for(const [key,value] of [['amount',1],['currency','USD'],['order_id','order_forged'],['captured',false]] as const){
    const original=(f.payment as any)[key];(f.payment as any)[key]=value;
    await assert.rejects(service.confirm(f.userId,f.input));(f.payment as any)[key]=original;
    assert.equal(await getAccess(f.userId,'sandbox'),null);
  }
  const first=await service.confirm(f.userId,f.input),again=await service.confirm(f.userId,f.input);
  assert.equal(first.expiresAt,again.expiresAt);assert.equal(again.duplicate,true);
});

test('signed webhooks, order.paid and callback replay converge; event collisions and test/live crossover fail',async()=>{
  const f=await fixture(),e=event('payment.captured',f.payment);
  await assert.rejects(service.webhook(e.raw,'f'.repeat(64),e.id,'test'),/signature/);
  await assert.rejects(service.webhook(e.raw,e.signature,e.id,'live'),/environment/);
  await assert.rejects(service.webhook(e.raw,e.signature,'','test'),/identifier/);
  const webhook=await service.webhook(e.raw,e.signature,e.id,'test');
  const callback=await service.confirm(f.userId,f.input);assert.equal(callback.expiresAt,(webhook as any).expiresAt);
  const paid=event('order.paid',f.payment);await service.webhook(paid.raw,paid.signature,paid.id,'test');
  const changed=event('order.paid',f.payment);await assert.rejects(service.webhook(changed.raw,changed.signature,e.id,'test'),/collision/);
  const [rows]:any=await database().execute('SELECT COUNT(*) AS n FROM access_passes WHERE user_id=?',[f.userId]);assert.equal(Number(rows[0].n),1);
});

test('refund-first delivery and interrupted checkout recovery use current provider data, never frontend success',async()=>{
  const f=await fixture();f.payment.amount_refunded=f.payment.amount;f.payment.status='refunded';
  const e=event('refund.processed',f.payment);await service.webhook(e.raw,e.signature,e.id,'test');
  assert.equal(await getAccess(f.userId,'sandbox'),null);
  assert.equal((await service.recover(f.userId,f.order.id)).status,'refunded');
  const second=await fixture();const recovered=await service.recover(second.userId,second.order.id);
  assert.equal(recovered.status,'active');assert.ok(await getAccess(second.userId,'sandbox'));
  second.payment.amount_refunded=100;
  const partial=event('refund.processed',second.payment);await service.webhook(partial.raw,partial.signature,partial.id,'test');assert.ok(await getAccess(second.userId,'sandbox'));
  second.payment.amount_refunded=second.payment.amount;second.payment.status='refunded';
  const full=event('refund.processed',second.payment);await service.webhook(full.raw,full.signature,full.id,'test');assert.equal(await getAccess(second.userId,'sandbox'),null);
});

test('uncaptured and failed checkout attempts grant nothing; live calls are disabled in local tests',async()=>{
  const f=await fixture();f.payment.captured=false;f.payment.status='failed';
  await assert.rejects(service.recover(f.userId,f.order.id),/No unique captured/);assert.equal(await getAccess(f.userId,'sandbox'),null);
  process.env.RAZORPAY_MODE='live';assert.throws(paymentMode,/not enabled/);
  process.env.RAZORPAY_MODE='misspelled';assert.throws(paymentMode,/Invalid/);process.env.RAZORPAY_MODE='test';
});
