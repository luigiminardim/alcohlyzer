---
name: svg-animation
description: 'Guidelines for building the Barfometer gauge with SVG and smooth needle animations.'
---

# SVG Animation Techniques

## Purpose

Guidelines for building the Barfometer gauge with SVG and smooth needle animations.

## SVG Gauge Structure

```svg
<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
  <!-- Background arc divided into zones -->
  <path d="..." fill="none" stroke="#7FA653" />
  <path d="..." fill="none" stroke="#EBC97F" />
  <path d="..." fill="none" stroke="#D45F58" />

  <!-- Needle (rotates around center) -->
  <line id="needle" x1="100" y1="100" x2="100" y2="20"
        stroke="var(--mantine-color-bright)" stroke-width="3" stroke-linecap="round" />

  <!-- Center cap -->
  <circle cx="100" cy="100" r="6" fill="var(--mantine-color-body)" />
</svg>
```

Runtime components must resolve these values through `src/presentation/zoneColors.ts` so gauge, visor, and notification feedback remain consistent.

## Needle Rotation

### Transform origin

The needle rotates around its base (center of gauge):

```css
.needle {
  transform-origin: 100px 100px; /* SVG coordinate center */
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
```

### Angle mapping

Map the 3 zones to angle ranges on a semi-circle (0° to 180°):

```
GREEN:  0° → 60°   (left third)
YELLOW: 60° → 120°  (middle third)
RED:    120° → 180° (right third)
```

### Setting needle position via JS

```typescript
function setNeedleAngle(angle: number) {
  const needle = document.getElementById('needle');
  if (needle) {
    needle.style.transform = `rotate(${angle - 90}deg)`;
  }
}
```

## Wobble Animation

The dramatic wobble effect uses `requestAnimationFrame`:

```typescript
function animateWobble(
  targetAngle: number,
  duration: number,
  onUpdate: (angle: number) => void,
  onComplete: () => void,
) {
  const startTime = performance.now();
  const wobbleAmplitude = 40; // degrees of random wobble

  function frame(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease-out wobble: amplitude decreases as progress increases
    const wobble = wobbleAmplitude * (1 - progress) * Math.sin(progress * 20);
    const currentAngle = targetAngle + wobble;

    onUpdate(currentAngle);

    if (progress < 1) {
      requestAnimationFrame(frame);
    } else {
      onUpdate(targetAngle); // snap to exact target
      onComplete();
    }
  }

  requestAnimationFrame(frame);
}
```

## Responsive SVG

### ViewBox scaling

```tsx
<svg
  viewBox="0 0 200 120"
  preserveAspectRatio="xMidYMid meet"
  style={{ width: '100%', maxWidth: '400px' }}
>
```

### Mobile considerations

- Use `touch-action: none` on gauge to prevent scroll interference
- Increase touch target size for zone double-tap (minimum 44x44px)
- Test on various screen sizes

## Performance Tips

- CSS transitions are GPU-accelerated (prefer over JS animation for simple movements)
- Use `requestAnimationFrame` only for complex, multi-frame animations (wobble)
- Avoid `getBBox()` and `getComputedStyle()` in animation loops (triggers layout)
- Use `will-change: transform` on the needle for GPU layer promotion
- Clean up animation frames on component unmount

## React Integration

```tsx
function GaugeNeedle({ angle }: { angle: number }) {
  return (
    <line
      x1="100"
      y1="100"
      x2="100"
      y2="20"
      stroke="var(--mantine-color-bright)"
      strokeWidth="3"
      strokeLinecap="round"
      style={{
        transformOrigin: '100px 100px',
        transform: `rotate(${angle - 90}deg)`,
        transition: 'transform 0.1s ease-out',
      }}
    />
  );
}
```
