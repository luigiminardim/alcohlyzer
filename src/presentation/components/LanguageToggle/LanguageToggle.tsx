import { useTranslation } from 'react-i18next';
import { ActionIcon } from '@mantine/core';

export function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'pt-BR' : 'en';
    i18n.changeLanguage(nextLang);
  };

  return (
    <ActionIcon
      onClick={toggleLanguage}
      size="xl"
      radius="xl"
      variant="filled"
      color="dark"
      title="Toggle Language"
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 50,
        boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
      }}
    >
      <span style={{ fontSize: '1.2rem' }}>{i18n.language === 'en' ? '🇺🇸' : '🇧🇷'}</span>
    </ActionIcon>
  );
}
