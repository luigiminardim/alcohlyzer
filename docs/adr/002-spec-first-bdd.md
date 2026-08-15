# ADR-002: Spec-First BDD Development

## Status

Accepted

## Context

We want to follow Behavior-Driven Development (BDD) to ensure we think about expected behavior before writing implementation code. The team needs a lightweight approach that doesn't require heavy tooling.

## Decision

Use **spec-first development** with Vitest and comment-based Given/When/Then:

- Write `.spec.ts` files BEFORE implementation (Red → Green → Refactor)
- Use `describe/it` blocks with BDD-style naming
- Structure tests with `// Given`, `// When`, `// Then` comments
- Colocate specs next to source files

## Consequences

### Positive

- Forces clear thinking about behavior and edge cases before coding
- Specs serve as living documentation of expected behavior
- No external Cucumber/Gherkin tooling overhead
- Vitest is fast and shares Vite's transform pipeline

### Negative

- Requires discipline to write specs first (easy to skip)
- Comment-based GWT isn't enforced by tooling (no step binding)
- Domain stakeholders can't read specs as easily as Gherkin feature files

## Alternatives Considered

- **Cucumber.js with Gherkin**: More formal BDD, but adds parsing overhead and complexity
- **Code-first with tests after**: Faster initially, but risks gaps in coverage
- **TDD without BDD style**: Loses the human-readable behavior documentation
