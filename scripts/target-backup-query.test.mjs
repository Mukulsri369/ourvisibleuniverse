import assert from 'node:assert/strict';
import { test } from 'node:test';
import { targetBackupQuery,verifyTargetBackup } from './target-backup-query.mjs';
const names=['access_passes','payment_orders'];
const required=['public.access_passes','public.payment_orders','auth.users','auth.identities','auth.mfa_factors','auth.webauthn_credentials','storage.objects','storage.buckets'];
const snapshot={format:'ovu-target-logical-backup-v1',project_ref:'pdvwkdggyyrfkoqrpbji',captured_at:'2026-11-06T05:30:00Z',
 public_tables:names,tables:Object.fromEntries(required.map(name=>[name,[]])),row_counts:Object.fromEntries(required.map(name=>[name,0])),
 functions:[],policies:[],indexes:[],columns:[],constraints:[],triggers:[],table_grants:[]};
test('backup query limits identifiers and captures every inventory table plus private identity/security metadata',()=>{
 const sql=targetBackupQuery(names);
 for (const table of required) assert.ok(sql.includes(`FROM ${table} t`));
 assert.ok(sql.includes('pg_get_functiondef'));assert.ok(sql.includes('pg_policies'));
 for (const invalid of [[],['users; DROP TABLE users'],['users','users'],['auth.users']])assert.throws(()=>targetBackupQuery(invalid));
});
test('backup verification rejects truncated arrays, missing tables, schema drift and wrong projects',()=>{
 assert.deepEqual(verifyTargetBackup(snapshot,names),{publicTables:2,tables:8,users:0,passes:0,rows:0});
 for (const changed of [{project_ref:'other'},{public_tables:[...names,'new_table']},{tables:{}},
  {row_counts:{...snapshot.row_counts,'auth.users':1}},{policies:undefined}])assert.throws(()=>verifyTargetBackup({...snapshot,...changed},names));
});
