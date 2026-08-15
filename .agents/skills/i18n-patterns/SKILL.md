---
name: i18n-patterns
description: 'Guidelines for implementing EN/PT-BR language support using react-i18next in the Barfometer project.'
---

# i18n (Internationalization) Patterns

## Purpose

Guidelines for implementing EN/PT-BR language support using react-i18next in the Barfometer project.

## Setup

### Initialization (`src/infrastructure/i18n/i18n.ts`)

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ptBR from './locales/pt-BR.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    'pt-BR': { translation: ptBR },
  },
  lng: 'en', // default language
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // React handles XSS protection
  },
});

export default i18n;
```

### Import in entry point

```typescript
// src/main.tsx
import '@/infrastructure/i18n/i18n';
```

## Translation Files

### Structure (namespace-based keys)

```json
// locales/en.json
{
  "gauge": {
    "green": "Clean",
    "yellow": "Small Charge",
    "red": "Big Charge"
  },
  "result": {
    "clean": "You're clean! 🎉",
    "smallCharge": "Small charge! 💰",
    "bigCharge": "BIG CHARGE! 🔥"
  },
  "action": {
    "start": "Start Test",
    "reset": "Reset",
    "blow": "Blow now!"
  },
  "toast": {
    "zoneSet": "Zone set: {{zone}}"
  },
  "settings": {
    "language": "Language"
  }
}
```

```json
// locales/pt-BR.json
{
  "gauge": {
    "green": "Limpo",
    "yellow": "Taxa Pequena",
    "red": "Taxa Grande"
  },
  "result": {
    "clean": "Tá limpo! 🎉",
    "smallCharge": "Taxa pequena! 💰",
    "bigCharge": "TAXA GRANDE! 🔥"
  },
  "action": {
    "start": "Iniciar Teste",
    "reset": "Reiniciar",
    "blow": "Sopre agora!"
  },
  "toast": {
    "zoneSet": "Zona definida: {{zone}}"
  },
  "settings": {
    "language": "Idioma"
  }
}
```

## Usage in Components

### `useTranslation` hook

```tsx
import { useTranslation } from 'react-i18next';

function ResultDisplay({ zone }: { zone: Zone }) {
  const { t } = useTranslation();

  return <h2>{t(`result.${zone.toLowerCase()}`)}</h2>;
}
```

### With interpolation

```tsx
notifications.show({
  message: t('toast.zoneSet', { zone: t(`gauge.${zone.toLowerCase()}`) }),
});
```

## Language Toggle

### Switching language

```tsx
import { useTranslation } from 'react-i18next';

function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggle = () => {
    const next = i18n.language === 'en' ? 'pt-BR' : 'en';
    i18n.changeLanguage(next);
    // Persist preference via StoragePort
  };

  return (
    <ActionIcon onClick={toggle} aria-label="Toggle language">
      {i18n.language === 'en' ? '🇧🇷' : '🇺🇸'}
    </ActionIcon>
  );
}
```

## Clean Architecture Integration

### i18n is Infrastructure

- Translation logic lives in `src/infrastructure/i18n/`
- Domain and application layers do NOT import i18n
- Domain returns keys/enums; presentation translates them

### Persisting language preference

```typescript
// StoragePort handles persistence
storage.saveLanguagePreference(language);
const savedLang = storage.loadLanguagePreference();
```
