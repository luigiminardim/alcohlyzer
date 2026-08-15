import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { alcohlyzerCssVariablesResolver, alcohlyzerTheme } from './presentation/theme';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './index.css';
import './infrastructure/i18n/i18n';

import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider
      defaultColorScheme="dark"
      theme={alcohlyzerTheme}
      cssVariablesResolver={alcohlyzerCssVariablesResolver}
    >
      <App />
    </MantineProvider>
  </StrictMode>,
);
