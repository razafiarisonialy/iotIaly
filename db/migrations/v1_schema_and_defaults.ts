// db/migrations/v1_schema_and_defaults.ts
import type * as SQLite from 'expo-sqlite';
import type { Migration } from './runner';

export const v1: Migration = {
  version: 1,
  name: 'schema_and_defaults',
  up: async (db: SQLite.SQLiteDatabase): Promise<void> => {
    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS sensor_readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sensor_type TEXT NOT NULL,
        value REAL NOT NULL,
        unit TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        is_anomaly INTEGER NOT NULL DEFAULT 0
      );`
    );
    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sensor_type TEXT NOT NULL,
        message TEXT NOT NULL,
        severity TEXT NOT NULL DEFAULT 'info',
        timestamp TEXT NOT NULL,
        acknowledged INTEGER NOT NULL DEFAULT 0
      );`
    );
    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT NOT NULL UNIQUE,
        value TEXT NOT NULL
      );`
    );
    await db.runAsync(
      'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)',
      'theme',
      'dark'
    );
    await db.runAsync(
      'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)',
      'alerts_enabled',
      'true'
    );
    await db.runAsync(
      'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)',
      'simulation_speed',
      'normal'
    );
    await db.runAsync(
      'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)',
      'use_real_weather',
      'false'
    );
    await db.runAsync(
      'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)',
      'weather_city',
      'Antananarivo'
    );
  },
};
