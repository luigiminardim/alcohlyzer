import { describe, it, expect } from 'vitest';
import { createBlowResult } from './BlowResult';
import { Zone } from './Zone';

describe('BlowResult', () => {
  it('should create a result with zone, intensity, and duration', () => {
    // Given: valid blow parameters
    const params = { zone: Zone.RED, intensity: 0.7, durationMs: 3000 };

    // When: a result is created
    const result = createBlowResult(params);

    // Then: it should contain the correct values
    expect(result.zone).toBe(Zone.RED);
    expect(result.intensity).toBe(0.7);
    expect(result.durationMs).toBe(3000);
  });

  it('should calculate animation duration proportional to blow duration', () => {
    // Given: two blows with different durations
    const shortBlow = createBlowResult({ zone: Zone.GREEN, intensity: 0.5, durationMs: 1000 });
    const longBlow = createBlowResult({ zone: Zone.GREEN, intensity: 0.5, durationMs: 5000 });

    // When: comparing animation durations

    // Then: longer blow should produce longer animation
    expect(longBlow.animationDurationMs).toBeGreaterThan(shortBlow.animationDurationMs);
  });

  it('should have a minimum animation duration', () => {
    // Given: a very short blow
    const result = createBlowResult({ zone: Zone.GREEN, intensity: 0.1, durationMs: 100 });

    // When: checking animation duration

    // Then: it should still have a reasonable minimum (at least 3 seconds)
    expect(result.animationDurationMs).toBeGreaterThanOrEqual(3000);
  });

  it('should have a maximum animation duration', () => {
    // Given: an extremely long blow
    const result = createBlowResult({ zone: Zone.RED, intensity: 1.0, durationMs: 60000 });

    // When: checking animation duration

    // Then: it should be capped (at most 10 seconds)
    expect(result.animationDurationMs).toBeLessThanOrEqual(10000);
  });

  it('should clamp intensity to 0 when negative', () => {
    // Given: a negative intensity value

    // When: creating a result
    const result = createBlowResult({ zone: Zone.YELLOW, intensity: -0.5, durationMs: 2000 });

    // Then: intensity should be clamped to 0
    expect(result.intensity).toBe(0);
  });

  it('should clamp intensity to 1 when above 1', () => {
    // Given: an intensity above 1

    // When: creating a result
    const result = createBlowResult({ zone: Zone.YELLOW, intensity: 1.5, durationMs: 2000 });

    // Then: intensity should be clamped to 1
    expect(result.intensity).toBe(1);
  });

  it('should require positive duration', () => {
    // Given: a zero or negative duration

    // When: creating a result

    // Then: it should throw
    expect(() => createBlowResult({ zone: Zone.GREEN, intensity: 0.5, durationMs: 0 })).toThrow();
    expect(() => createBlowResult({ zone: Zone.GREEN, intensity: 0.5, durationMs: -100 })).toThrow();
  });
});
