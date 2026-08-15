import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { LocalStorageAdapter } from '../adapters/LocalStorageAdapter';

import en from './locales/en.json';
import ptBR from './locales/pt-BR.json';

const storage = new LocalStorageAdapter();
const savedLang = storage.loadLanguagePreference() || 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    'pt-BR': { translation: ptBR },
  },
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // React handles XSS
  },
});

// Save preference when language changes
i18n.on('languageChanged', (lng) => {
  storage.saveLanguagePreference(lng);
});

export default i18n;
