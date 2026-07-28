---
name: typescript-strict
description: "Enforce maximum type safety in the Barfometer project using TypeScript 6+ strict features."
---

# TypeScript Strict Mode & Type Safety

## Purpose
Enforce maximum type safety in the Barfometer project using TypeScript 6+ strict features.

## Compiler Configuration

Enabled in `tsconfig.app.json`:
- `"strict": true` — enables all strict checks
- `"noUncheckedIndexedAccess": true` — array/object indexing returns `T | undefined`

## Rules

### Never use `any`
```typescript
// ❌ Bad
function process(data: any): any { ... }

// ✅ Good: use unknown + narrowing
function process(data: unknown): BlowResult {
  if (!isValidSoundData(data)) {
    throw new Error('Invalid sound data');
  }
  return analyzeData(data);
}
```

### Use discriminated unions for state machines
```typescript
// ✅ The SessionState pattern for BarfometerSession
type SessionState =
  | { kind: 'IDLE' }
  | { kind: 'ZONE_SET'; presetZone: Zone }
  | { kind: 'LISTENING'; presetZone: Zone }
  | { kind: 'ANIMATING'; presetZone: Zone; blowData: BlowData }
  | { kind: 'RESULT'; presetZone: Zone; result: BlowResult };
```

### Exhaustive switch with `never`
```typescript
function getZoneLabel(zone: Zone): string {
  switch (zone) {
    case Zone.GREEN: return 'Clean';
    case Zone.YELLOW: return 'Small Charge';
    case Zone.RED: return 'Big Charge';
    default: {
      const _exhaustive: never = zone;
      throw new Error(`Unknown zone: ${_exhaustive}`);
    }
  }
}
```

### `readonly` by default
```typescript
// ✅ Value objects are immutable
interface BlowResult {
  readonly zone: Zone;
  readonly intensity: number;
  readonly duration: number;
  readonly animationDuration: number;
}

// ✅ Arrays that shouldn't be mutated
function getZones(): readonly Zone[] {
  return [Zone.GREEN, Zone.YELLOW, Zone.RED];
}
```

### Branded types for type safety
```typescript
// Prevent mixing up raw numbers
type Intensity = number & { readonly __brand: 'Intensity' };
type Duration = number & { readonly __brand: 'Duration' };

function createIntensity(value: number): Intensity {
  if (value < 0 || value > 1) throw new RangeError('Intensity must be 0-1');
  return value as Intensity;
}
```

### Useful utility types
```typescript
// Pick only what you need
type ZoneConfig = Pick<FullConfig, 'color' | 'label'>;

// Make things optional for test data
type PartialSession = Partial<BarfometerSession>;

// Ensure all keys are handled
type ZoneLabels = Record<Zone, string>;

// Exclude specific values
type ActiveState = Exclude<SessionState, { kind: 'IDLE' }>;
```

### Prefer `interface` for objects, `type` for unions/intersections
```typescript
// ✅ Interface for object shapes (extensible)
interface StoragePort {
  savePresetZone(zone: Zone): void;
  loadPresetZone(): Zone | null;
}

// ✅ Type for unions and computed types
type SessionStateKind = 'IDLE' | 'ZONE_SET' | 'LISTENING' | 'ANIMATING' | 'RESULT';
```

### Function return types
```typescript
// ✅ Explicit return types for public APIs
export function createBlowResult(params: BlowParams): BlowResult { ... }

// ✅ Inferred is fine for internal/private helpers
const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);
```
