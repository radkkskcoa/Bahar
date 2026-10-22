/**
 * Lightweight i18n. UI chrome is translated (English + Persian with RTL);
 * catalog content comes from the database as entered by the business.
 *
 * Strings live in `./locales/<code>.js` and every locale shares the same keys.
 * `translate` supports `{placeholder}` interpolation: t('cart.minimum', { amount }).
 */
import en from './locales/en.js';
import fa from './locales/fa.js';

export const LANGUAGES = [
  { code: 'en', label: 'English', dir: 'ltr', locale: 'en-US' },
  { code: 'fa', label: 'فارسی', dir: 'rtl', locale: 'fa-IR' },
];

export const DEFAULT_LANGUAGE = 'fa';

export const DICTIONARIES = { en, fa };

export function translate(lang, key, params) {
  const dict = DICTIONARIES[lang] ?? en;
  const template = dict[key] ?? en[key] ?? key;
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name) =>
    params[name] === undefined || params[name] === null ? match : String(params[name]));
}
