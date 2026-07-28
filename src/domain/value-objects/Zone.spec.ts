import { describe, it, expect } from 'vitest';
import { Zone, ZONES, getZoneLabel, getZoneColor } from './Zone';

describe('Zone', () => {
  it('should have exactly three valid zones: GREEN, YELLOW, RED', () => {
    // Given: the set of all zones

    // When: we enumerate all zones

    // Then: there should be exactly three
    expect(ZONES).toHaveLength(3);
    expect(ZONES).toContain(Zone.GREEN);
    expect(ZONES).toContain(Zone.YELLOW);
    expect(ZONES).toContain(Zone.RED);
  });

  it('should provide a label for each zone', () => {
    // Given: each zone variant

    // When: we get labels

    // Then: each should have a non-empty string label
    expect(getZoneLabel(Zone.GREEN)).toBe('clean');
    expect(getZoneLabel(Zone.YELLOW)).toBe('smallCharge');
    expect(getZoneLabel(Zone.RED)).toBe('bigCharge');
  });

  it('should provide a color hex for each zone', () => {
    // Given: each zone variant

    // When: we get colors

    // Then: each should return a valid hex color
    expect(getZoneColor(Zone.GREEN)).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(getZoneColor(Zone.YELLOW)).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(getZoneColor(Zone.RED)).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it('should have distinct colors for each zone', () => {
    // Given: the colors for all zones

    // When: we compare them

    // Then: all colors should be unique
    const colors = ZONES.map(getZoneColor);
    const uniqueColors = new Set(colors);
    expect(uniqueColors.size).toBe(3);
  });
});
