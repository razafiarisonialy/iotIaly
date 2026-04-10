// db/index.ts
import * as SQLite from 'expo-sqlite';
import { DATABASE_NAME } from '@/utils/constants';
import { runMigrations } from './migrations/runner';

let database: SQLite.SQLiteDatabase | null = null;

export async function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (database) return database;

  database = await SQLite.openDatabaseAsync(DATABASE_NAME);

  // WAL mode : meilleure performance, non critique si échoue
  try {
    await database.execAsync('PRAGMA journal_mode = WAL;');
  } catch {
    // Continue avec le mode DELETE par défaut
  }

  await database.execAsync('PRAGMA foreign_keys = ON;');

  await runMigrations(database);

  return database;
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!database) return initializeDatabase();
  return database;
}

export async function closeDatabase(): Promise<void> {
  if (database) {
    await database.closeAsync();
    database = null;
  }
}
