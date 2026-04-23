import type * as SQLite from 'expo-sqlite';
import type { Migration } from './runner';

export const v2: Migration = {
  version: 2,
  name: 'indexes',
  up: async (db: SQLite.SQLiteDatabase): Promise<void> => {
    await db.execAsync(
      'CREATE INDEX IF NOT EXISTS idx_readings_sensor_type ON sensor_readings(sensor_type);'
    );
    await db.execAsync(
      'CREATE INDEX IF NOT EXISTS idx_readings_timestamp ON sensor_readings(timestamp);'
    );
    await db.execAsync(
      'CREATE INDEX IF NOT EXISTS idx_readings_sensor_timestamp ON sensor_readings(sensor_type, timestamp);'
    );
    await db.execAsync(
      'CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON alerts(acknowledged);'
    );
    await db.execAsync(
      'CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(timestamp);'
    );
    await db.execAsync(
      'CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);'
    );
  },
};
