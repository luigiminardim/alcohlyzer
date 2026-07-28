# ADR-001: Clean Architecture

## Status
Accepted

## Context
Barfometer is a simple single-page PWA, but we want to use it as a learning exercise in proper software architecture. The app interacts with browser APIs (Web Audio, localStorage) that are difficult to test directly.

## Decision
Use **classic Clean Architecture** with four layers:
1. **Domain** — entities, value objects, port interfaces
2. **Application** — use cases orchestrating domain logic
3. **Infrastructure** — concrete adapters for browser APIs
4. **Presentation** — React components and hooks

Dependencies point inward only (Dependency Rule).

## Consequences
### Positive
- Domain and application layers are fully testable without browser mocks
- Easy to swap infrastructure (e.g., IndexedDB instead of localStorage)
- Clear separation of concerns makes the codebase navigable
- Forces thinking about domain behavior independent of UI

### Negative
- More files and folders than a typical single-page app needs
- Some indirection (ports/adapters) for simple operations like localStorage
- Composition root (DI wiring) adds complexity to hooks

## Alternatives Considered
- **Feature-based architecture**: Simpler for small apps, but doesn't enforce layer boundaries
- **MVC**: Less suitable for React's unidirectional data flow
- **No architecture**: Fastest to build, but harder to maintain and test
