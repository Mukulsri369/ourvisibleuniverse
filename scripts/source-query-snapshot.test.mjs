import assert from 'node:assert/strict';
import { test } from 'node:test';
import { sourceQueryCopy } from './source-query-snapshot.mjs';
import { readCopyTables } from './customer-reconciliation.mjs';
const snapshot = {format:'ovu-source-snapshot-v1',project_id:'6f478791-cfcb-4931-ba58-b9ed1948e8d4',
  captured_at:'2026-11-06T10:42:14.589379+05:30',public_tables:['access_passes'],tables:{
    'auth.users':[{id:'synthetic-user',email:'qa@example.invalid',encrypted_password:'synthetic-hash',
      raw_user_meta_data:{name:'A\tB\nC\\N',extra:['α',true]},is_anonymous:false,email_confirmed_at:null}],
    'auth.identities':[], 'public.access_passes':[{id:'synthetic-pass',user_id:'synthetic-user',
      expires_at:'2026-12-06T10:42:14.589379+05:30',days:30,environment:'live'}],
    'auth.mfa_factors':[], 'auth.webauthn_credentials':[], 'storage.objects':[], 'storage.buckets':[]}};
test('read-only snapshot conversion preserves nulls, JSON, escapes and entitlement microseconds',()=>{
  const parsed=readCopyTables(sourceQueryCopy(snapshot));
  const user=parsed.get('auth.users').rows[0];
  assert.equal(user.encrypted_password,'synthetic-hash');assert.equal(user.is_anonymous,'f');
  assert.equal(user.email_confirmed_at,null);assert.deepEqual(JSON.parse(user.raw_user_meta_data),snapshot.tables['auth.users'][0].raw_user_meta_data);
  assert.equal(parsed.get('public.access_passes').rows[0].expires_at,snapshot.tables['public.access_passes'][0].expires_at);
  assert.equal(parsed.get('auth.identities').rows.length,0);assert.equal(parsed.size,7);
});
test('unknown origin, missing tables and unmapped public data fail before reconciliation',()=>{
  for (const change of [{format:'unknown'},{project_id:'other'},{captured_at:'invalid'},
    {public_tables:['access_passes','unmapped']},{tables:{'auth.users':[]}}]) assert.throws(()=>sourceQueryCopy({...snapshot,...change}));
  assert.throws(()=>sourceQueryCopy({...snapshot,tables:{...snapshot.tables,'auth.users':[{"id) ; SELECT":'unsafe'}]}}));
});
