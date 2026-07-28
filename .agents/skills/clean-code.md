# Clean Code Principles

## Purpose
Guide for writing clean, maintainable, and readable code in the Barfometer project.

## SOLID Principles

### Single Responsibility (SRP)
- Each class/module should have ONE reason to change
- Each file exports ONE primary concept
- Use cases do ONE thing: orchestrate a single business operation

### Open/Closed (OCP)
- Entities and value objects are open for extension, closed for modification
- Use interfaces (ports) to allow new implementations without changing domain code

### Liskov Substitution (LSP)
- Any adapter implementing a port must be substitutable without breaking behavior
- Example: `LocalStorageAdapter` and a future `IndexedDBAdapter` must both satisfy `StoragePort`

### Interface Segregation (ISP)
- Keep port interfaces small and focused
- `MicrophonePort` doesn't include storage methods; `StoragePort` doesn't include audio methods

### Dependency Inversion (DIP)
- Domain and application layers depend on abstractions (ports), NOT concrete implementations
- Infrastructure provides concrete adapters injected at composition root

## Naming Conventions

### Functions/Methods
- Use **verbs**: `setZone()`, `startTest()`, `detectBlow()`, `resetSession()`
- Boolean functions: `isBlowDetected()`, `isListening()`, `hasPresetZone()`

### Classes/Types
- Use **nouns**: `BarfometerSession`, `Zone`, `BlowResult`
- Interfaces for ports: `MicrophonePort`, `StoragePort`

### Variables
- Use descriptive names: `presetZone` not `pz`, `blowDuration` not `dur`
- Constants: `UPPER_SNAKE_CASE` for true constants, `camelCase` for derived values

### Files
- Match the primary export: `BarfometerSession.ts`, `SetZoneUseCase.ts`
- Specs colocated: `BarfometerSession.spec.ts`

## Code Patterns

### Guard Clauses / Early Returns
```typescript
// ✅ Good: early return
function startTest(session: BarfometerSession): void {
  if (!session.hasPresetZone()) {
    throw new Error('Cannot start test without a preset zone');
  }
  // main logic here
}

// ❌ Bad: nested if
function startTest(session: BarfometerSession): void {
  if (session.hasPresetZone()) {
    // deeply nested main logic
  } else {
    throw new Error('Cannot start test without a preset zone');
  }
}
```

### Pure Functions
- Domain logic should be pure where possible (same input → same output)
- Side effects belong in infrastructure adapters

### Immutability
- Use `readonly` for properties that shouldn't change after construction
- Return new objects instead of mutating: `session.withZone(zone)` over `session.zone = zone`

### No Magic Numbers/Strings
```typescript
// ✅ Good
const BLOW_DETECTION_THRESHOLD = 150;
const LOW_FREQ_ENERGY_THRESHOLD = 400;

// ❌ Bad
if (volume > 150 && lowFreqEnergy > 400) { ... }
```

## Code Smells to Avoid
- **God objects**: Classes doing too much → split into focused entities
- **Primitive obsession**: Use value objects (Zone, BlowResult) instead of raw strings/numbers
- **Feature envy**: Methods that use more data from another class than their own
- **Long parameter lists**: Use object parameters when >3 args
- **Comments explaining "what"**: Code should be self-documenting; comments explain "why"
