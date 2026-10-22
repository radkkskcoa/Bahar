import { useCatalog } from '../context/CatalogContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';
import { formatMoney } from './format.js';

/** Currency formatting bound to the configured currency and the active language. */
export function useMoney() {
  const { currency } = useCatalog();
  const { locale } = useI18n();
  return (cents) => formatMoney(cents, currency, locale);
}
