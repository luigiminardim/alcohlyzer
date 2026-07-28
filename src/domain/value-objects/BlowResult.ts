import type { Zone } from './Zone';

const MIN_ANIMATION_DURATION_MS = 3000;
const MAX_ANIMATION_DURATION_MS = 10000;

/**
 * Parameters for creating a BlowResult.
 */
export interface BlowResultParams {
  readonly zone: Zone;
  readonly intensity: number;
  readonly durationMs: number;
}

/**
 * BlowResult is an immutable value object representing the outcome
 * of a blower's test. It includes the (rigged) zone result,
 * blow intensity, duration, and calculated animation duration.
 */
export interface BlowResult {
  readonly zone: Zone;
  readonly intensity: number;
  readonly durationMs: number;
  readonly animationDurationMs: number;
}

/**
 * Clamps a value between min and max (inclusive).
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculates the animation duration based on blow duration and intensity.
 * Longer/harder blows produce longer animations (more drama).
 * Result is clamped between MIN and MAX animation durations.
 */
function calculateAnimationDuration(durationMs: number, intensity: number): number {
  // Base: proportional to blow duration (scaled down)
  // Multiplier: intensity adds 0-50% more animation time
  const base = durationMs * 0.8;
  const intensityBonus = base * intensity * 0.5;
  const raw = base + intensityBonus;

  return clamp(raw, MIN_ANIMATION_DURATION_MS, MAX_ANIMATION_DURATION_MS);
}

/**
 * Creates an immutable BlowResult.
 * - Clamps intensity to [0, 1]
 * - Requires positive durationMs
 * - Calculates animation duration proportionally
 */
export function createBlowResult(params: BlowResultParams): BlowResult {
  if (params.durationMs <= 0) {
    throw new RangeError('Blow duration must be positive');
  }

  const intensity = clamp(params.intensity, 0, 1);
  const animationDurationMs = calculateAnimationDuration(params.durationMs, intensity);

  return Object.freeze({
    zone: params.zone,
    intensity,
    durationMs: params.durationMs,
    animationDurationMs,
  });
}
