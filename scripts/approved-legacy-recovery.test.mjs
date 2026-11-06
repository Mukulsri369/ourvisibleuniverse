import assert from 'node:assert/strict';
import { test } from 'node:test';
import {validateApprovedLegacyPayment,assertRegisteredOrder} from './approved-legacy-recovery.mjs';
const approval={scope:'owner-reviewed-30-day-recovery-20261106',orderId:'order_Synthetic',paymentId:'pay_Synthetic',sourceUserId:'11111111-1111-4111-8111-111111111111',targetUserId:'22222222-2222-4222-8222-222222222222',reviewSha256:'a'.repeat(64)};
const order={id:approval.orderId,notes:{userId:approval.sourceUserId,planId:'universe_30_days'},receipt:'ovu_'+'b'.repeat(28),amount:17900,amount_paid:17900,currency:'INR',status:'paid'};
const payment={id:approval.paymentId,order_id:order.id,amount:17900,currency:'INR',captured:true,status:'captured',amount_refunded:0};
test('reviewed original owner maps to the confirmed target identity without copying provider notes as target authority',()=>{
 const stored=validateApprovedLegacyPayment(approval,order,payment);
 assert.equal(stored.userId,approval.targetUserId);assert.equal(stored.days,30);assert.equal(stored.environment,'live');
 assertRegisteredOrder(stored,stored);
});
test('different identity, plan, payment, amount, currency, capture or refund cannot enter approved recovery',()=>{
 for(const change of [{id:'order_Other'},{notes:{...order.notes,userId:approval.targetUserId}},{notes:{...order.notes,planId:'universe_365_days'}},
  {amount:100},{currency:'USD'},{amount_paid:0},{status:'created'},{receipt:'another-site'}]) assert.throws(()=>validateApprovedLegacyPayment(approval,{...order,...change},payment));
 for(const change of [{id:'pay_Other'},{order_id:'order_Other'},{amount:100},{currency:'USD'},{captured:false},{status:'authorized'},{amount_refunded:1},{status:'refunded',amount_refunded:17900}])assert.throws(()=>validateApprovedLegacyPayment(approval,order,{...payment,...change}));
 assert.throws(()=>validateApprovedLegacyPayment({...approval,scope:'generic-recovery'},order,payment));
 assert.throws(()=>validateApprovedLegacyPayment({...approval,reviewSha256:''},order,payment));
});
test('an existing conflicting registered order is never overwritten or used to grant access',()=>{
 const stored=validateApprovedLegacyPayment(approval,order,payment);
 for(const field of Object.keys(stored))assert.throws(()=>assertRegisteredOrder({...stored,[field]:'conflicting'},stored));
});
