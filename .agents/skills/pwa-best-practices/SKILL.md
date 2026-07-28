---
name: pwa-best-practices
description: "Guidelines for building the Barfometer as a high-quality Progressive Web App."
---

# PWA Best Practices

## Purpose
Guidelines for building the Barfometer as a high-quality Progressive Web App.

## Architecture

### vite-plugin-pwa
- Mode: `generateSW` (auto-generated service worker via Workbox)
- Registration: `autoUpdate` (seamless background updates)
- All static assets pre-cached (HTML, CSS, JS, SVG, fonts)

### Service Worker Lifecycle
1. **Install**: Pre-cache all app shell assets
2. **Activate**: Clean up old caches
3. **Fetch**: Serve from cache, fall back to network

### Caching Strategies
| Resource | Strategy | Rationale |
|----------|----------|-----------|
| App shell (HTML, CSS, JS) | Pre-cache | Instant load on repeat visits |
| Fonts (Google Fonts) | CacheFirst | Rarely change, save bandwidth |
| Icons/images | CacheFirst | Static assets |

## Manifest (`public/manifest.json`)

Required fields for installability:
```json
{
  "name": "Barfometer",
  "short_name": "Barfometer",
  "description": "The ultimate wedding party breathalyzer game",
  "start_url": "/barfometer/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#ffffff",
  "background_color": "#ffffff",
  "icons": [
    { "src": "pwa-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "pwa-512x512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "pwa-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

## HTTPS Requirement

PWA features (service workers, microphone access) require HTTPS:
- **Development**: `localhost` is treated as secure
- **Testing on phone**: Use `ngrok` tunnel or deploy to GitHub Pages
- **Production**: GitHub Pages provides HTTPS automatically

## Offline UX

- App loads from cache when offline
- Microphone may not work offline (depends on permission state)
- Display a subtle "offline" indicator if connectivity matters

## Testing

```bash
# Build for production (service workers only work in production builds)
~/.nvm/nvm-exec npm run build

# Preview the production build
~/.nvm/nvm-exec npm run preview
```

### Lighthouse Audit
1. Open Chrome DevTools → Lighthouse
2. Run "Progressive Web App" audit
3. Target: 100/100 installable + PWA optimized

### iOS Considerations
- iOS may evict PWA storage after ~7 days of inactivity
- Always handle graceful cache miss (re-fetch if needed)
- `display: standalone` removes Safari UI chrome
