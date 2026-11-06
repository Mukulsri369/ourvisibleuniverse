import assert from 'node:assert/strict';
import { test } from 'node:test';
import {pendingRegistration,registerLegacyPending} from './legacy-pending-orders.mjs';
const mapping={sourceId:'11111111-1111-4111-8111-111111111111',targetId:'22222222-2222-4222-8222-222222222222',sourceCreatedAt:'2026-10-01T00:00:00Z'};
const order={id:'order_Synthetic',amount:10900,amount_paid:0,amount_due:10900,currency:'INR',status:'created',created_at:1792000000,receipt:'ovu_'+'a'.repeat(28),notes:{userId:mapping.sourceId,planId:'universe_30_days',currency:'INR'}};
test('legacy ownership is explicitly mapped and historical provider price is preserved',()=>{
 const row=pendingRegistration(order,order,[mapping],1793000000);assert.equal(row.amount,10900);assert.equal(row.userId,mapping.targetId);assert.equal(row.days,30);
});
test('optional provider currency note may be absent while the authenticated order currency remains mandatory',()=>{
 const {currency:unused,...notes}=order.notes;
 const fresh={...order,notes};const exported={...fresh,notes:{...notes,currency:null}};
 assert.equal(pendingRegistration(exported,fresh,[mapping],1793000000).currency,'INR');
 const conflicting={...order,notes:{...order.notes,currency:'USD'}};
 assert.throws(()=>pendingRegistration(conflicting,conflicting,[mapping],1793000000));
});
test('unknown owner, changed amount/plan, future order, paid state or wrong receipt is rejected',()=>{
 for(const change of [{id:'order_Other'},{amount:1},{receipt:'other-site'},{created_at:1794000000},{amount_paid:1},
  {status:'paid'},{notes:{...order.notes,planId:'universe_365_days'}},{notes:{...order.notes,userId:mapping.targetId}}])assert.throws(()=>pendingRegistration(order,{...order,...change},[mapping],1793000000));
 assert.throws(()=>pendingRegistration(order,order,[],1793000000));assert.throws(()=>pendingRegistration(order,order,[mapping,mapping],1793000000));
});
test('registration appends ownership only and retry preserves existing bindings without duplicate rows',async()=>{
 const rows=[];let writes=0;const input={candidates:[order],mappings:[mapping],cutoffUnix:1793000000,providerRead:async()=>order,listExisting:async()=>structuredClone(rows),insert:async row=>{rows.push(row);writes++;}};
 const first=await registerLegacyPending(input);assert.equal(first.summary.ordersInserted,1);assert.equal(first.summary.accessGrantsPerformed,0);
 const retry=await registerLegacyPending(input);assert.equal(retry.summary.ordersInserted,0);assert.equal(retry.summary.existingOrdersPreserved,1);assert.equal(writes,1);
});
test('all candidate validation and immutable conflicts are checked before any append',async()=>{
 let writes=0;const input={candidates:[order],mappings:[mapping],cutoffUnix:1793000000,providerRead:async()=>order,listExisting:async()=>[{...pendingRegistration(order,order,[mapping],1793000000),userId:mapping.sourceId}],insert:async()=>{writes++;}};
 await assert.rejects(registerLegacyPending(input));assert.equal(writes,0);
 await assert.rejects(registerLegacyPending({...input,candidates:[order,order]}));assert.equal(writes,0);
});
