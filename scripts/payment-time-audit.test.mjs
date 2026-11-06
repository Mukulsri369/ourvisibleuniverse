import assert from 'node:assert/strict';
import { test } from 'node:test';
import { paymentTimeRelation } from './payment-time-audit.mjs';
test('older provider events predate both IST source snapshot and webhook setup',()=>{
  const seconds=Date.parse('2026-11-01T05:00:00Z')/1000;
  assert.deepEqual(paymentTimeRelation(seconds,'2026-11-06T10:42:14.589379+05:30','2026-11-06T01:59:11+05:30'),
    {createdAfterSourceSnapshot:false,createdAfterWebhookSetup:false});
});
test('UTC and IST representations compare identically at second boundaries',()=>{
  const seconds=Date.parse('2026-11-06T05:00:01Z')/1000;
  assert.deepEqual(paymentTimeRelation(seconds,'2026-11-06T05:00:00Z','2026-11-06T10:30:02+05:30'),
    {createdAfterSourceSnapshot:true,createdAfterWebhookSetup:false});
});
test('locale dates, Date objects and milliseconds cannot silently change event ordering',()=>{
  for(const input of ['11/06/2026 10:42:14',new Date(), '2026-11-06T10:42:14'])
    assert.throws(()=>paymentTimeRelation(1790000000,input,'2026-11-06T00:00:00Z'));
  assert.throws(()=>paymentTimeRelation(1790000000000,'2026-11-06T00:00:00Z','2026-11-06T00:00:00Z'));
});
