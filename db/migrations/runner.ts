// db/migrations/runner.ts
import type * as SQLite from 'expo-sqlite';
import { MIGRATIONS } from './registry';

export interface Migration {
  version: number;
  name: string;
  up: (db: SQLite.SQLiteDatabase) => Promise<void>;
}

async function ensureVersionTable(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(
    'CREATE TABLE IF NOT EXISTS schema_version (version INTEGER NOT NULL DEFAULT 0);'
  );
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM schema_version'
  );
  if (!row || row.count === 0) {
    await db.runAsync('INSERT INTO schema_version (version) VALUES (?)', 0);
  }
}

async function getCurrentVersion(db: SQLite.SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ version: number }>(
    'SELECT version FROM schema_version LIMIT 1'
  );
  return row?.version ?? 0;
}

export async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  await ensureVersionTable(db);
  const currentVersion = await getCurrentVersion(db);

  const pending = MIGRATIONS
    .filter((m) => m.version > currentVersion)
    .sort((a, b) => a.version - b.version);

  for (const migration of pending) {
    await db.withTransactionAsync(async () => {
      await migration.up(db);
      await db.runAsync(
        'UPDATE schema_version SET version = ?',
        migration.version
      );
    });
  }
}
