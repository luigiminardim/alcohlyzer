import { createTheme, rem } from '@mantine/core';

export const barfometerTheme = createTheme({
  primaryColor: 'dark',
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
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
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
        }
      }
    }
  },
});
