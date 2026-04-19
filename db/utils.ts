import { getDatabase } from './index';
import { purgeAllReadings } from './repositories/sensorRepository';
import { purgeAllAlerts } from './repositories/alertRepository';

export async function getDatabaseSize(): Promise<number> {
  const db = await getDatabase();
  const pageCount = await db.getFirstAsync<{ page_count: number }>(
    'PRAGMA page_count'
  );
  const pageSize = await db.getFirstAsync<{ page_size: number }>(
    'PRAGMA page_size'
  );
  if (pageCount && pageSize) {
    return pageCount.page_count * pageSize.page_size;
  }
  return 0;
}

export function formatDatabaseSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export async function purgeAllData(): Promise<{
  deletedReadings: number;
  deletedAlerts: number;
}> {
  const deletedReadings = await purgeAllReadings();
  const deletedAlerts = await purgeAllAlerts();
  return { deletedReadings, deletedAlerts };
}
