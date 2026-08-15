---
name: git-workflow
description: 'Standardize version control practices for the Barfometer project.'
---

# Git Workflow & Conventional Commits

## Purpose

Standardize version control practices for the Barfometer project.

## Conventional Commits

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type       | Description                 | SemVer |
| ---------- | --------------------------- | ------ |
| `feat`     | New feature                 | MINOR  |
| `fix`      | Bug fix                     | PATCH  |
| `docs`     | Documentation only          | —      |
| `style`    | Formatting, no logic change | —      |
| `refactor` | Code change, no feature/fix | —      |
| `perf`     | Performance improvement     | —      |
| `test`     | Adding/fixing tests         | —      |
| `build`    | Build system, dependencies  | —      |
| `ci`       | CI/CD changes               | —      |
| `chore`    | Maintenance tasks           | —      |

### Scopes (Barfometer-specific)

- `domain` — entities, value objects, ports
- `app` — use cases (application layer)
- `infra` — adapters, i18n
- `ui` — React components, hooks, CSS
- `pwa` — service worker, manifest
- `config` — vite, tsconfig, vitest, postcss

### Examples

```
feat(domain): add Zone value object with GREEN, YELLOW, RED variants
test(domain): add spec for BarfometerSession state transitions
feat(app): implement SetZoneUseCase with storage persistence
feat(infra): add WebAudioMicrophoneAdapter for blow detection
feat(ui): implement SVG gauge with animated needle
fix(ui): correct needle wobble easing curve
docs: add ubiquitous language glossary
chore(config): configure vitest with jsdom environment
feat(pwa): add service worker with offline caching
feat!: change Zone.SMALL to Zone.YELLOW (BREAKING)
```

## Branching Strategy

### GitHub Flow (simple)

- `main` — always deployable
- `feature/<name>` — short-lived feature branches
- `fix/<name>` — bug fix branches

### Branch naming

```
feature/gauge-component
feature/blow-detection
fix/needle-animation-jitter
chore/update-mantine
```

## Commit Best Practices

### Atomic commits

- One logical change per commit
- Each commit should leave the project in a working state
- Specs and implementation in the same commit (spec-first, but committed together)

### Commit message guidelines

- Imperative mood: "add" not "added" or "adds"
- First line ≤ 72 characters
- Body explains "why", not "what" (code shows what)

## .gitignore

Key patterns already in `.gitignore`:

```
node_modules/
dist/
*.local
.env*
```
