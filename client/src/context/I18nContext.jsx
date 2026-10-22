import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { LANGUAGES, translate } from '../lib/i18n.js';

const I18nContext = createContext(null);
const STORAGE_KEY = 'ch_language';

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return LANGUAGES.some((l) => l.code === stored) ? stored : 'en';
  });

  const setLanguage = useCallback((code) => {
    localStorage.setItem(STORAGE_KEY, code);
    setLanguageState(code);
  }, []);

  const value = useMemo(() => {
    const meta = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];
    return {
      language,
      setLanguage,
      languages: LANGUAGES,
      dir: meta.dir,
      isRtl: meta.dir === 'rtl',
      locale: meta.locale,
      t: (key) => translate(language, key),
    };
  }, [language, setLanguage]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
