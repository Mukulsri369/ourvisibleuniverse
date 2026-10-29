import assert from 'node:assert/strict';
import { test, after } from 'node:test';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { database, closeDatabase, transaction } from '../src/backend/db.server';
import { migrate, splitSql } from '../src/backend/migrations.server';

assert.equal(process.env.DB_HOST,'127.0.0.1');
assert.equal(process.env.DB_PORT,'3307');
assert.equal(process.env.DB_NAME,'ovu_main');
after(closeDatabase);

test('SQL splitter preserves literals, escaped quotes, comments and JSON semicolons', () => {
  assert.deepEqual(splitSql("-- comment;\nSELECT 'a;''b'; /* ; */ SELECT '{\"x\":\";\"}'"),["SELECT 'a;''b'", "SELECT '{\"x\":\";\"}'"]);
  assert.throws(()=>splitSql("SELECT 'unterminated"));
});

test('real MariaDB schema migrates, replays without changes and detects drift', async () => {
  await migrate(resolve('mariadb/migrations'));
  assert.deepEqual(await migrate(resolve('mariadb/migrations')),[]);
  const temp=await mkdtemp(join(tmpdir(),'ovu-migration-'));
  try {
    await writeFile(join(temp,'0000_auth.sql'),'SELECT 1;');
    await assert.rejects(migrate(temp),/checksum drift/);
  } finally { await rm(temp,{recursive:true,force:true}); }
});

test('UTC, Unicode, JSON constraints and FK relations are real database invariants', async () => {
  const connections=await Promise.all(Array.from({length:8},()=>database().getConnection()));
  try {
    for(const c of connections){
      const [clock]:any=await c.query('SELECT @@session.time_zone AS zone, TIMESTAMPDIFF(SECOND,UTC_TIMESTAMP(),CURRENT_TIMESTAMP()) AS offset_seconds');
      assert.equal(clock[0].zone,'+00:00');assert.equal(Number(clock[0].offset_seconds),0);
    }
  } finally { connections.forEach(c=>c.release()); }
  const id=randomUUID();
  const connection=await database().getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute('INSERT INTO auth_user(id,name,email,emailVerified) VALUES(?,?,?,false)',[id,'तारा 🌌',id+'@example.test']);
    await connection.execute('INSERT INTO student_profiles(user_id,student_public_id) VALUES(?,?)',[id,'student-'+id]);
    const [rows]:any=await connection.execute('SELECT name FROM auth_user WHERE id=?',[id]);
    assert.equal(rows[0].name,'तारा 🌌');
    await assert.rejects(connection.execute('UPDATE student_profiles SET accessibility_settings=? WHERE user_id=?',['{bad json',id]));
    await assert.rejects(connection.execute('INSERT INTO student_profiles(user_id,student_public_id) VALUES(?,?)',[randomUUID(),'missing-parent-'+id]));
    await assert.rejects(connection.execute('UPDATE student_profiles SET selected_level=? WHERE user_id=?',['forged-level',id]));
    const [fks]:any=await connection.query("SELECT COUNT(*) AS count FROM information_schema.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=DATABASE()");
    assert.ok(Number(fks[0].count)>20,'Inline REFERENCES must result in actual FK constraints');
  } finally { await connection.rollback();connection.release(); }
});

test('application transaction rolls back on failure', async()=>{
  const id=randomUUID();
  await assert.rejects(transaction(async c=>{
    await c.execute('INSERT INTO auth_user(id,name,email,emailVerified) VALUES(?,?,?,false)',[id,'Rollback',id+'@example.test']);
    throw Error('intentional rollback');
  }),/intentional rollback/);
  const [rows]:any=await database().execute('SELECT id FROM auth_user WHERE id=?',[id]);
  assert.equal(rows.length,0);
});
