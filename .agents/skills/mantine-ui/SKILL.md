---
name: mantine-ui
description: 'Guidelines for using Mantine UI in the Barfometer project — theming, notifications, hooks, and CSS Modules.'
---

# Mantine UI Best Practices

## Purpose

Guidelines for using Mantine UI in the Barfometer project — theming, notifications, hooks, and CSS Modules.

## MantineProvider Setup

```tsx
// src/main.tsx
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { barfometerTheme } from '@/presentation/theme';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <MantineProvider theme={barfometerTheme}>
    <Notifications position="top-center" autoClose={2000} />
    <App />
  </MantineProvider>,
);
```

## Theme Customization (`src/presentation/theme.ts`)

```typescript
import { createTheme } from '@mantine/core';

export const barfometerTheme = createTheme({
  primaryColor: 'dark',
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  defaultRadius: 'md',
  colors: {
    // Custom colors can be added here if needed
  },
  components: {
    Notification: {
      defaultProps: {
        withCloseButton: false,
      },
    },
  },
});
```

## Notifications (Toast Replacement)

Use `@mantine/notifications` instead of a custom Toast component:

```typescript
import { notifications } from '@mantine/notifications';

// Zone preset confirmation
notifications.show({
  message: `Zone set: ${zoneName} ${zoneEmoji}`,
  color: zoneColor, // 'green' | 'yellow' | 'red'
  autoClose: 2000,
  withCloseButton: false,
});
```

## Useful Hooks (`@mantine/hooks`)

### `useTimeout`

```typescript
// Auto-dismiss or delayed actions
const { start, clear } = useTimeout(() => {
  // action after delay
}, 3000);
```

### `useMediaQuery`

```typescript
// Responsive behavior
const isMobile = useMediaQuery('(max-width: 48em)');
```

### `useClickOutside`

```typescript
// Close menus/popovers
const ref = useClickOutside(() => setOpened(false));
```

### `useDisclosure`

```typescript
// Toggle state with open/close/toggle helpers
const [opened, { open, close, toggle }] = useDisclosure(false);
```

## CSS Modules Integration

Mantine works perfectly with CSS Modules. Use `.module.css` for component-specific styles:

```tsx
import classes from './Gauge.module.css';

function Gauge() {
  return <div className={classes.container}>...</div>;
}
```

```css
/* Gauge.module.css */
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 400px;
}
```

## Components Used in Barfometer

| Mantine Component  | Usage                                  |
| ------------------ | -------------------------------------- |
| `Notifications`    | Zone preset confirmation toast         |
| `ActionIcon`       | Language toggle, reset button          |
| `Text`             | Result display labels                  |
| `Overlay`          | Result overlay background              |
| `Transition`       | Animated entry/exit for result display |
| `SegmentedControl` | Language toggle (EN/PT-BR)             |

## Tree-Shaking

Mantine v9 is tree-shakeable. Import only what you use:

```typescript
// ✅ Good: named imports
import { ActionIcon, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';

// ❌ Bad: wildcard import
import * as Mantine from '@mantine/core';
```

## Style Props vs CSS Modules

- **Style props** (≤3 per component): Quick spacing, colors
  ```tsx
  <Text size="lg" fw={700} c="red.6">
    BIG CHARGE!
  </Text>
  ```
- **CSS Modules** (>3 styles or complex layout): Component-specific styling
  ```tsx
  <div className={classes.gaugeContainer}>...</div>
  ```
