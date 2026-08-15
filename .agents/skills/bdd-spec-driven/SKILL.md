---
name: bdd-spec-driven
description: 'Guide for writing behavior-driven specs using Vitest with comment-based Given/When/Then structure.'
---

# BDD / Spec-Driven Development Patterns

## Purpose

Guide for writing behavior-driven specs using Vitest with comment-based Given/When/Then structure.

## Spec-First Workflow

1. **Write the spec** (`.spec.ts`) describing the expected behavior
2. **Run the spec** — it should fail (RED)
3. **Implement the minimum code** to make it pass (GREEN)
4. **Refactor** while keeping specs green (REFACTOR)
5. **Repeat** for the next behavior

## Naming Conventions

### `describe` blocks — Feature / Component name

```typescript
describe('BarfometerSession', () => {
  describe('Zone Setup', () => { ... });
  describe('Test Execution', () => { ... });
  describe('Result', () => { ... });
});
```

### `it` blocks — "should" + expected behavior

```typescript
it('should start in IDLE state');
it('should transition to ZONE_SET after zone is set');
it('should reject starting a test without a preset zone');
```

## Given / When / Then Pattern

Use comments to structure each test into three clear phases:

```typescript
it('should transition to ZONE_SET state after zone is set', () => {
  // Given: a new session in IDLE state
  const session = new BarfometerSession();

  // When: the officer sets a preset zone
  session.setPresetZone(Zone.RED);

  // Then: the session should be in ZONE_SET state
  expect(session.state).toBe(SessionState.ZONE_SET);
  expect(session.presetZone).toBe(Zone.RED);
});
```

## Test Organization Rules

### One concept per test

```typescript
// ✅ Good: tests ONE behavior
it('should clamp intensity between 0 and 1', () => {
  const result = BlowResult.create({ zone: Zone.GREEN, intensity: 1.5, duration: 3 });
  expect(result.intensity).toBe(1);
});

// ❌ Bad: tests multiple unrelated things
it('should create a valid blow result', () => {
  const result = BlowResult.create({ zone: Zone.GREEN, intensity: 0.5, duration: 3 });
  expect(result.zone).toBe(Zone.GREEN);
  expect(result.intensity).toBe(0.5);
  expect(result.duration).toBe(3);
  expect(result.animationDuration).toBeGreaterThan(0);
  // too many assertions about different behaviors
});
```

### Test edge cases explicitly

```typescript
describe('BlowResult', () => {
  it('should create a result with valid values');
  it('should clamp intensity to 0 when negative');
  it('should clamp intensity to 1 when above 1');
  it('should require positive duration');
  it('should throw on zero duration');
});
```

## Test Doubles

### When to use mocks (for ports)

```typescript
import { vi } from 'vitest';

// Mock a port interface
const mockStorage: StoragePort = {
  savePresetZone: vi.fn(),
  loadPresetZone: vi.fn(() => null),
  saveLanguagePreference: vi.fn(),
  loadLanguagePreference: vi.fn(() => null),
};
```

### When NOT to mock

- Domain entities and value objects — use real instances
- Pure functions — no side effects, no mocks needed

## File Naming

- Specs colocated with source: `Zone.ts` → `Zone.spec.ts`
- Same directory, same name, `.spec.ts` suffix
- Pattern: `src/domain/value-objects/Zone.spec.ts`

## Running Specs

```bash
# Run all specs
~/.nvm/nvm-exec npm test

# Run specific spec
~/.nvm/nvm-exec npx vitest run src/domain/value-objects/Zone.spec.ts

# Watch mode
~/.nvm/nvm-exec npm run test:watch

# Coverage (domain + application layers)
~/.nvm/nvm-exec npm run test:coverage
```
