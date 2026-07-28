---
name: react-best-practices
description: "Guidelines for React component design, hooks usage, and state management in the Barfometer project."
---

# React Best Practices

## Purpose
Guidelines for React component design, hooks usage, and state management in the Barfometer project.

## Component Patterns

### Composition over inheritance
```tsx
// ✅ Compose small, focused components
<Gauge>
  <GaugeZone zone={Zone.GREEN} onDoubleTap={handleSetZone} />
  <GaugeZone zone={Zone.YELLOW} onDoubleTap={handleSetZone} />
  <GaugeZone zone={Zone.RED} onDoubleTap={handleSetZone} />
  <GaugeNeedle angle={needleAngle} />
</Gauge>
```

### Smart hooks, dumb components
- Components: render UI, handle DOM events, delegate to hooks
- Hooks: contain business logic, bridge to Clean Architecture use cases
```tsx
// Component is a thin rendering layer
function App() {
  const { state, setZone, startTest, reset } = useBarfometer();
  return <Gauge state={state} onZoneTap={setZone} />;
}
```

### Props interface naming
```tsx
interface GaugeProps {
  readonly needleAngle: number;
  readonly activeZone: Zone | null;
  readonly onZoneDoubleTap: (zone: Zone) => void;
}
```

## Hooks Rules

### Custom hooks for logic extraction
```tsx
// ✅ Extract complex logic into dedicated hooks
function useMicrophone() { ... }
function useGaugeAnimation() { ... }
function useBarfometer() { ... }  // composition root
```

### Dependency arrays
```tsx
// ✅ Memoize expensive objects
const storage = useMemo(() => new LocalStorageAdapter(), []);

// ✅ Stable callbacks
const handleSetZone = useCallback((zone: Zone) => {
  setZoneUseCase.execute(zone);
}, [setZoneUseCase]);
```

### Cleanup effects
```tsx
// ✅ Always clean up side effects
useEffect(() => {
  mic.startListening(handleSoundData);
  return () => mic.stopListening();
}, [mic, handleSoundData]);
```

## Error Boundaries
```tsx
// Wrap the app in an error boundary for graceful failures
// Especially important for microphone permission denials
<ErrorBoundary fallback={<MicPermissionError />}>
  <App />
</ErrorBoundary>
```

## Performance

### Avoid unnecessary re-renders
- Use `React.memo` only when profiling shows a bottleneck
- Keep state as local as possible
- `useRef` for values that don't trigger re-renders (animation frames)

### Animation state
```tsx
// ✅ Use ref for animation frame IDs — no re-render needed
const animationFrameRef = useRef<number>(0);

// ✅ Use state only for values that affect the DOM
const [needleAngle, setNeedleAngle] = useState(0);
```

## Accessibility

- Use semantic HTML (`<button>`, not `<div onClick>`)
- Provide `aria-label` for icon-only buttons
- Ensure keyboard navigability for interactive elements
- Use Mantine components (they handle ARIA automatically)
