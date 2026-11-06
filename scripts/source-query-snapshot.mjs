// Convert the legitimate read-only SQL-editor export into the existing data-only
// reconciliation format. Nothing in the export is executed as SQL.
import assert from 'node:assert/strict';
const tables = ['auth.users', 'auth.identities', 'public.access_passes', 'auth.mfa_factors',
  'auth.webauthn_credentials', 'storage.objects', 'storage.buckets'];
function copyValue(value) {
  if (value === null || value === undefined) return '\\N';
  if (typeof value === 'number') assert.ok(Number.isFinite(value), 'Invalid number');
  const text = typeof value === 'object' ? JSON.stringify(value) :
    typeof value === 'boolean' ? (value ? 't' : 'f') : String(value);
  return text.replaceAll('\\', '\\\\').replaceAll('\t', '\\t').replaceAll('\n', '\\n').replaceAll('\r', '\\r');
}
export function sourceQueryCopy(snapshot) {
  assert.equal(snapshot.format, 'ovu-source-snapshot-v1');
  assert.equal(snapshot.project_id, '6f478791-cfcb-4931-ba58-b9ed1948e8d4');
  assert.ok(Number.isFinite(Date.parse(snapshot.captured_at)), 'Capture timestamp required');
  assert.deepEqual(snapshot.public_tables, ['access_passes'], 'Additional public tables require explicit mapping');
  assert.deepEqual(Object.keys(snapshot.tables).sort(), [...tables].sort(), 'Incomplete source snapshot');
  return tables.map(table => {
    const rows = snapshot.tables[table];
    assert.ok(Array.isArray(rows) && rows.length < 100000, 'Invalid table export');
    assert.ok(rows.every(row => row && typeof row === 'object' && !Array.isArray(row)), 'Invalid row');
    const columns = rows.length ? [...new Set(rows.flatMap(Object.keys))].sort() : ['id'];
    assert.ok(columns.every(column => /^[a-z_][a-z0-9_]*$/.test(column)), 'Invalid column');
    return `COPY ${table} (${columns.join(', ')}) FROM stdin;\n` +
      rows.map(row => columns.map(column => copyValue(row[column])).join('\t')).join('\n') +
      (rows.length ? '\n' : '') + '\\.\n';
  }).join('\n');
}
