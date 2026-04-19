import { Alert } from 'react-native';
import i18n from '@/services/i18n';

export function showErrorToast(translationKey: string, interpolation?: Record<string, string | number>): void {
  const title = i18n.t('common.error');
  const message = i18n.t(translationKey, interpolation);
  Alert.alert(title, message);
}

export function showInfoToast(title: string, message: string): void {
  Alert.alert(title, message);
}
