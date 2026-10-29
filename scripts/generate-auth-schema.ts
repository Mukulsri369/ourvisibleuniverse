import { getMigrations } from 'better-auth/db/migration';
import { authOptions } from '../src/backend/auth.server';
import { closeDatabase } from '../src/backend/db.server';
import { mkdir, writeFile } from 'node:fs/promises';

try {
  const plan = await getMigrations(authOptions());
  if (plan.unsafeChanges.length) throw new Error('Unsafe authentication schema changes; manual review required');
  const sql = await plan.compileMigrations();
  if (!sql.trim()) throw new Error('Expected a fresh database when generating the initial auth schema');
  await mkdir('mariadb/migrations', { recursive: true });
  await writeFile('mariadb/migrations/0000_auth.sql', '-- Generated from the pinned Better Auth configuration; review before execution.\n' + sql + '\n');
  console.log('Generated independent authentication schema (no credentials included).');
} finally { await closeDatabase(); }
