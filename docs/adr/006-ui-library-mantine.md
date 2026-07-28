# ADR-006: UI Library — Mantine

## Status
Accepted

## Context
Barfometer needs a minimal set of UI components: toast notifications, buttons/icons, text styling, overlays, and a language toggle. The project uses vanilla CSS / CSS Modules (no Tailwind). The app is a PWA, so bundle size matters.

## Decision
Use **Mantine UI** (`@mantine/core`, `@mantine/hooks`, `@mantine/notifications`) as the component library.

## Consequences
### Positive
- **No Tailwind dependency**: Mantine uses CSS Modules and PostCSS, aligning with our vanilla CSS preference
- **Built-in Notifications**: `@mantine/notifications` replaces the need for a custom Toast component
- **Rich hooks library**: `@mantine/hooks` provides `useTimeout`, `useMediaQuery`, `useClickOutside`, etc.
- **Accessible by default**: Components handle ARIA attributes automatically
- **Tree-shakeable**: Only ships code for components we import
- **PostCSS theming**: Centralized theme via `MantineProvider` + `createTheme()`

### Negative
- Bundle size (~50-120KB) is larger than going fully custom or headless
- Adds a framework opinion on top of our Clean Architecture
- PostCSS setup adds a build dependency (`postcss-preset-mantine`)

## Components Used
| Component | Purpose |
|-----------|---------|
| `Notifications` | Zone preset confirmation (replaces custom Toast) |
| `ActionIcon` | Language toggle button, reset button |
| `Text` | Result display labels |
| `Overlay` | Result overlay background |
| `Transition` | Animated entry/exit for results |
| `SegmentedControl` | EN/PT-BR language toggle |

## What Remains Custom
- **SVG Gauge**: No UI library provides a breathalyzer gauge. Fully custom SVG + CSS
- **Wobble Animation**: Custom `requestAnimationFrame` logic
- **Blow Detection**: Custom Web Audio API integration

## Alternatives Considered
- **shadcn/ui**: Excellent accessibility (Radix), but requires Tailwind CSS
- **Radix UI Primitives**: Headless/unstyled, maximum control but more work
- **Chakra UI**: Good DX but heavier bundle and runtime CSS-in-JS
- **No library**: Minimal bundle but more work for accessible, polished components
