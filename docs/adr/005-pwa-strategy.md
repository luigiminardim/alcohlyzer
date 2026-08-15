# ADR-005: PWA Strategy

## Status

Accepted

## Context

Barfometer will be used at a wedding venue where internet connectivity may be unreliable. The app should be installable on the officer's phone home screen and work without an internet connection.

## Decision

Use **vite-plugin-pwa** with `generateSW` mode and `autoUpdate` registration type.

## Consequences

### Positive

- Installable on home screen — feels like a native app
- Works offline after first load (all assets pre-cached)
- Automatic background updates when new versions are deployed
- `generateSW` handles all service worker complexity automatically
- Workbox optimizes caching strategies under the hood

### Negative

- Service workers only work in production builds (not dev mode)
- iOS may evict PWA storage after ~7 days of inactivity
- `autoUpdate` silently updates — no user prompt for breaking changes

## Implementation Details

- All static assets pre-cached (HTML, CSS, JS, SVG, fonts)
- No runtime caching needed (no API calls)
- Manifest configured for portrait orientation, standalone display
- Icons: 192x192 and 512x512 (with maskable variant)
- GitHub Pages provides HTTPS automatically

## Alternatives Considered

- **`injectManifest` mode**: More control over service worker logic, but unnecessary for our simple caching needs
- **`prompt` registration**: Shows update notification to user, but adds UX complexity for a simple party game
- **No PWA**: Simplest, but loses offline capability and installability — critical for a wedding venue
