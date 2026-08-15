import { describe, expect, it } from 'vitest';
import { ZoneStatus } from '../domain/value-objects/IntensityZone';
import { getZoneColor } from './zoneColors';

describe('Zone colors', () => {
  it('should map intensity zones to the approved colors', () => {
    // Given: the three domain intensity zone statuses
    const statuses = [ZoneStatus.LOW, ZoneStatus.MID, ZoneStatus.HIGH] as const;

    // When: their presentation colors are resolved
    const colors = statuses.map(getZoneColor);

    // Then: each status uses its exact approved value
    expect(colors).toEqual(['#7FA653', '#EBC97F', '#D45F58']);
  });
});
