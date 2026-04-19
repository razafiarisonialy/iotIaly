import { format, formatDistanceToNow, parseISO, subHours, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { TimePeriod } from '@/types';

export function formatDateTime(dateString: string): string {
  return format(parseISO(dateString), 'dd MMM yyyy, HH:mm', { locale: fr });
}

export function formatTime(dateString: string): string {
  return format(parseISO(dateString), 'HH:mm:ss');
}

export function formatChartTime(dateString: string): string {
  return format(parseISO(dateString), 'HH:mm');
}

export function formatRelativeTime(dateString: string): string {
  return formatDistanceToNow(parseISO(dateString), {
    addSuffix: true,
    locale: fr,
  });
}

export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

export function getStartDateForPeriod(period: TimePeriod): string {
  const now = new Date();
  switch (period) {
    case '1h':
      return subHours(now, 1).toISOString();
    case '6h':
      return subHours(now, 6).toISOString();
    case '24h':
      return subHours(now, 24).toISOString();
    case '7d':
      return subDays(now, 7).toISOString();
    case '30d':
      return subDays(now, 30).toISOString();
  }
}
