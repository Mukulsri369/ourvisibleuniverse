import assert from 'node:assert/strict';
/** Read-only logical application/auth backup; no SQL from a backup is executed. */
export function targetBackupQuery(publicTables) {
  assert.ok(Array.isArray(publicTables) && publicTables.length > 0 && publicTables.length <= 100);
  assert.equal(new Set(publicTables).size, publicTables.length);
  assert.ok(publicTables.every(name => /^[a-z_][a-z0-9_]*$/.test(name)));
  const tables = [...publicTables.map(name => `public.${name}`), 'auth.users', 'auth.identities',
    'auth.mfa_factors', 'auth.webauthn_credentials', 'storage.objects', 'storage.buckets'];
  // jsonb_object_agg avoids PostgreSQL's function argument limit with growing inventories.
  const select = tables.map(table => `SELECT '${table}' AS name, coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb) AS data FROM ${table} t`).join('\nUNION ALL\n');
  return `WITH data AS (${select})
SELECT jsonb_build_object(
 'format','ovu-target-logical-backup-v1','project_ref','pdvwkdggyyrfkoqrpbji','captured_at',transaction_timestamp(),
 'public_tables',(SELECT jsonb_agg(tablename ORDER BY tablename) FROM pg_tables WHERE schemaname='public'),
 'tables',(SELECT jsonb_object_agg(name,data) FROM data),
 'row_counts',(SELECT jsonb_object_agg(name,jsonb_array_length(data)) FROM data),
 'functions',(SELECT coalesce(jsonb_agg(pg_get_functiondef(p.oid)),'[]'::jsonb) FROM pg_proc p JOIN pg_namespace n ON p.pronamespace=n.oid WHERE n.nspname='public' AND p.prokind='f'),
 'policies',(SELECT coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) FROM pg_policies t WHERE schemaname='public'),
 'indexes',(SELECT coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) FROM pg_indexes t WHERE schemaname='public'),
 'columns',(SELECT coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) FROM information_schema.columns t WHERE table_schema='public'),
 'constraints',(SELECT coalesce(jsonb_agg(jsonb_build_object('table',r.relname,'name',c.conname,'definition',pg_get_constraintdef(c.oid,true))),'[]'::jsonb) FROM pg_constraint c JOIN pg_class r ON c.conrelid=r.oid JOIN pg_namespace n ON r.relnamespace=n.oid WHERE n.nspname='public'),
 'triggers',(SELECT coalesce(jsonb_agg(pg_get_triggerdef(t.oid,true)),'[]'::jsonb) FROM pg_trigger t JOIN pg_class r ON t.tgrelid=r.oid JOIN pg_namespace n ON r.relnamespace=n.oid WHERE n.nspname='public' AND NOT t.tgisinternal),
 'table_grants',(SELECT coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) FROM information_schema.role_table_grants t WHERE table_schema='public')
) AS snapshot;`;
}

export function verifyTargetBackup(snapshot, expectedTables) {
  assert.equal(snapshot.format,'ovu-target-logical-backup-v1');
  assert.equal(snapshot.project_ref,'pdvwkdggyyrfkoqrpbji');
  assert.ok(Number.isFinite(Date.parse(snapshot.captured_at)));
  assert.deepEqual([...snapshot.public_tables].sort(), [...expectedTables].sort());
  const required=[...expectedTables.map(name=>`public.${name}`),'auth.users','auth.identities','auth.mfa_factors',
    'auth.webauthn_credentials','storage.objects','storage.buckets'].sort();
  assert.deepEqual(Object.keys(snapshot.tables).sort(),required);
  assert.deepEqual(Object.keys(snapshot.row_counts).sort(),required);
  for (const table of required) {
    assert.ok(Array.isArray(snapshot.tables[table]));
    assert.equal(snapshot.tables[table].length,snapshot.row_counts[table]);
  }
  for (const field of ['functions','policies','indexes','columns','constraints','triggers','table_grants']) assert.ok(Array.isArray(snapshot[field]));
  return {publicTables:expectedTables.length, tables:required.length,
    users:snapshot.tables['auth.users'].length,passes:snapshot.tables['public.access_passes']?.length,
    rows:required.reduce((sum,table)=>sum+snapshot.tables[table].length,0)};
}
