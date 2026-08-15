import {
  createTheme,
  rem,
  type CSSVariablesResolver,
  type MantineColorsTuple,
} from '@mantine/core';

const brand: MantineColorsTuple = [
  '#ecf5ff',
  '#dee6f3',
  '#bfcbdc',
  '#9eaec6',
  '#8296b4',
  '#6f86a8',
  '#647ea4',
  '#536c90',
  '#476083',
  '#385376',
];

export const alcohlyzerTheme = createTheme({
  colors: { brand },
  primaryColor: 'brand',
  white: '#F3EFE5',
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  defaultRadius: 'md',
  headings: {
    fontFamily: 'Outfit, Inter, system-ui, -apple-system, sans-serif',
    sizes: {
      h1: { fontSize: rem(48), lineHeight: '1.2', fontWeight: '900' },
      h2: { fontSize: rem(32), lineHeight: '1.3', fontWeight: '800' },
    },
  },
  components: {
    Notification: {
      defaultProps: {
        withCloseButton: false,
      },
      styles: {
        root: {
          padding: '12px 16px',
          boxShadow: 'var(--mantine-shadow-md)',
        },
        title: {
          fontWeight: 700,
        },
      },
    },
    ActionIcon: {
      defaultProps: {
        variant: 'subtle',
      },
    },
    Button: {
      defaultProps: {
        size: 'lg',
        radius: 'xl',
      },
      styles: {
        root: {
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '1px',
        },
      },
    },
  },
});

export const alcohlyzerCssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: {},
  dark: {
    '--mantine-color-body': '#121824',
    '--mantine-color-text': '#F3EFE5',
    '--mantine-color-bright': '#F3EFE5',
    '--mantine-color-dimmed': 'var(--mantine-color-brand-3)',
    '--mantine-color-default': '#1C2637',
    '--mantine-color-default-hover': 'var(--mantine-color-brand-9)',
    '--mantine-color-default-color': '#F3EFE5',
    '--mantine-color-default-border': 'var(--mantine-color-brand-8)',
    '--mantine-primary-color-contrast': '#F3EFE5',
  },
});
