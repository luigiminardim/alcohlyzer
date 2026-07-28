---
name: clean-architecture
description: "Enforce strict layer boundaries and dependency rules in the Barfometer project."
---

# Clean Architecture Patterns

## Purpose
Enforce strict layer boundaries and dependency rules in the Barfometer project.

## Layer Structure

```
┌──────────────────────────────────────┐
│          Presentation Layer          │  React components, hooks, CSS
│  (depends on Application)            │
├──────────────────────────────────────┤
│         Infrastructure Layer         │  Adapters: Web Audio, localStorage, i18n
│  (implements Domain ports)           │
├──────────────────────────────────────┤
│          Application Layer           │  Use cases: SetZone, StartTest, ProcessBlow
│  (depends on Domain only)            │
├──────────────────────────────────────┤
│            Domain Layer              │  Entities, Value Objects, Ports (interfaces)
│  (depends on NOTHING)                │
└──────────────────────────────────────┘
```

## The Dependency Rule

**Dependencies point INWARD only.**

- ✅ `presentation/` → `application/` → `domain/`
- ✅ `infrastructure/` → `domain/` (implements ports)
- ❌ `domain/` → `infrastructure/` (NEVER)
- ❌ `domain/` → `application/` (NEVER)
- ❌ `application/` → `presentation/` (NEVER)

## Domain Layer (`src/domain/`)

### What belongs here:
- **Entities**: `BarfometerSession` — the aggregate root with state machine
- **Value Objects**: `Zone`, `BlowResult` — immutable, equality by value
- **Ports (interfaces)**: `MicrophonePort`, `StoragePort`, `SoundAnalyzerPort`
- **Domain types**: `SessionState`, `SoundData`

### Rules:
- **ZERO imports** from React, Mantine, Web Audio API, localStorage, or any framework
- Only imports from other domain files or standard TypeScript
- All external dependencies are abstracted behind port interfaces
- Fully testable with plain unit tests (no mocking of browser APIs)

## Application Layer (`src/application/`)

### What belongs here:
- **Use cases**: `SetZoneUseCase`, `StartTestUseCase`, `ProcessBlowUseCase`, `ResetSessionUseCase`

### Rules:
- Orchestrates domain entities and ports
- Receives ports via constructor injection (Dependency Inversion)
- Does NOT import concrete adapters — only port interfaces from domain
- Does NOT import React hooks or components

### Use Case Pattern:
```typescript
export class SetZoneUseCase {
  constructor(
    private readonly session: BarfometerSession,
    private readonly storage: StoragePort,
  ) {}

  execute(zone: Zone): void {
    this.session.setPresetZone(zone);
    this.storage.savePresetZone(zone);
  }
}
```

## Infrastructure Layer (`src/infrastructure/`)

### What belongs here:
- **Adapters**: Concrete implementations of domain ports
  - `WebAudioMicrophoneAdapter` implements `MicrophonePort`
  - `LocalStorageAdapter` implements `StoragePort`
  - `AnalyserNodeSoundAdapter` implements `SoundAnalyzerPort`
- **Third-party integrations**: i18n setup, PWA registration

### Rules:
- Implements domain port interfaces
- CAN import browser APIs (Web Audio, localStorage)
- CAN import third-party libraries (i18next)
- Does NOT import from application or presentation layers

## Presentation Layer (`src/presentation/`)

### What belongs here:
- **React components**: Gauge, ResultDisplay, LanguageToggle
- **Custom hooks**: `useBarfometer`, `useMicrophone`, `useGaugeAnimation`
- **Theme**: Mantine theme configuration
- **CSS Modules**: Component-specific styles

### Rules:
- CAN import from Mantine, React, CSS Modules
- Uses custom hooks to bridge Clean Architecture use cases to React state
- Components are "dumb" — they render state, delegate actions to hooks
- Hooks instantiate use cases and adapters (composition root)

## Dependency Injection

The composition root lives in the presentation layer (hooks). This is where
concrete adapters are instantiated and injected into use cases:

```typescript
// src/presentation/hooks/useBarfometer.ts
function useBarfometer() {
  const storage = useMemo(() => new LocalStorageAdapter(), []);
  const session = useMemo(() => {
    const savedZone = storage.loadPresetZone();
    return new BarfometerSession(savedZone);
  }, [storage]);
  const setZoneUseCase = useMemo(
    () => new SetZoneUseCase(session, storage),
    [session, storage],
  );
  // ...
}
```

## Testing Implications

| Layer | Test Type | Mocks Needed |
|-------|-----------|-------------|
| Domain | Pure unit tests | None |
| Application | Unit tests | Mock ports (interfaces) |
| Infrastructure | Integration tests | May need browser API mocks |
| Presentation | Component tests | Mock hooks or use cases |
