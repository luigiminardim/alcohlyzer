# ADR-003: SVG Gauge Rendering

## Status
Accepted

## Context
The barfometer's core visual element is a velocimeter-style gauge with an animated needle. The gauge must be responsive across phone screens, support smooth animations, and allow zone-based interaction (double-tap to preset).

## Decision
Use **SVG** for the gauge with **CSS transitions** for smooth needle animation and **requestAnimationFrame** for the wobble effect.

## Consequences
### Positive
- SVG is resolution-independent — crisp on all screen densities
- CSS transitions are GPU-accelerated for smooth rotation
- SVG elements are part of the DOM — easy to add event listeners for double-tap
- Lightweight — no external charting/gauge library needed
- Easy to style with CSS Modules

### Negative
- Requires manual calculation of arc paths and angle ranges
- Complex wobble animation needs custom `requestAnimationFrame` logic
- SVG coordinate system can be confusing (transform-origin in SVG space)

## Implementation Details
- Gauge is a semi-circle divided into 3 zones (GREEN, YELLOW, RED)
- Needle rotates via `transform: rotate()` with `transform-origin` at center
- Wobble: amplitude decreases over time, frequency creates suspenseful oscillation
- Zone interaction: each zone arc is a separate SVG path with `onDoubleClick`

## Alternatives Considered
- **Canvas**: More control for complex animations but not part of DOM (harder for event handling), not resolution-independent without manual scaling
- **CSS-only gauge**: Creative but limited for dynamic needle wobble
- **D3.js**: Powerful but overkill for a single gauge, adds significant bundle weight
