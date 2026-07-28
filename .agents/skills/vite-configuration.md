# Vite Configuration & Optimization

## Purpose
Best practices for Vite setup, build optimization, and plugin usage in the Barfometer project.

## Path Aliases

Configured in `vite.config.ts` (NOT tsconfig — TS 6 deprecated baseUrl):
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
},
```

Usage:
```typescript
import { Zone } from '@/domain/value-objects/Zone';
import { SetZoneUseCase } from '@/application/SetZoneUseCase';
```

## Environment Variables

- Prefix with `VITE_` for client-side access
- Access via `import.meta.env.VITE_*`
- Define types in `src/vite-env.d.ts`:
```typescript
/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
}
```

## Build Optimization

### Code splitting with React.lazy
```typescript
// Only if app grows — currently single-page, not needed
const Gauge = React.lazy(() => import('./components/Gauge/Gauge'));
```

### Dependency optimization
```typescript
// vite.config.ts
optimizeDeps: {
  include: ['@mantine/core', '@mantine/hooks', '@mantine/notifications'],
},
```

## GitHub Pages Deployment

### Base path
```typescript
// Must match repo name for GitHub Pages
base: '/barfometer/',
```

### Build script
```json
"build": "tsc -b && vite build && cp dist/index.html dist/404.html"
```
The `404.html` copy ensures SPA routing works on GitHub Pages.

## Dev Server

```bash
# Start dev server
~/.nvm/nvm-exec npm run dev

# Preview production build
~/.nvm/nvm-exec npm run build && ~/.nvm/nvm-exec npm run preview
```

## Plugin Ecosystem

Currently used:
- `@vitejs/plugin-react` — React Fast Refresh
- `vite-plugin-pwa` — Service worker generation, manifest

## PostCSS Integration

Mantine requires PostCSS preset. Configuration in `postcss.config.cjs`:
- `postcss-preset-mantine` — Mantine CSS variable processing
- `postcss-simple-vars` — Breakpoint variables
