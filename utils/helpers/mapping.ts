import type {
  SensorReading,
  SensorReadingRow,
  Alert,
  AlertRow,
  SensorType,
  SeverityLevel,
} from '@/types';

export function mapRowToSensorReading(row: SensorReadingRow): SensorReading {
  return {
    id: row.id,
    sensorType: row.sensor_type as SensorType,
    value: row.value,
    unit: row.unit as SensorReading['unit'],
    timestamp: row.timestamp,
    isAnomaly: row.is_anomaly === 1,
  };
}

export function mapRowToAlert(row: AlertRow): Alert {
  return {
    id: row.id,
    sensorType: row.sensor_type as SensorType,
    message: row.message,
    severity: row.severity as SeverityLevel,
    timestamp: row.timestamp,
    acknowledged: row.acknowledged === 1,
  };
}
