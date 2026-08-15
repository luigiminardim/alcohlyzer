import { describe, it, expect } from 'vitest';
import { IntensityZone, ZoneStatus } from './IntensityZone';
import { Intensity } from './Intensity';

describe('IntensityZone', () => {
  describe('Constants', () => {
    it('should have correctly defined LOW_ZONE', () => {
      expect(IntensityZone.LOW_ZONE.status).toBe(ZoneStatus.LOW);
    });

    it('should have correctly defined MID_ZONE', () => {
      expect(IntensityZone.MID_ZONE.status).toBe(ZoneStatus.MID);
    });

    it('should have correctly defined HIGH_ZONE', () => {
      expect(IntensityZone.HIGH_ZONE.status).toBe(ZoneStatus.HIGH);
    });
  });

  describe('fromIntensity()', () => {
    it('should return LOW_ZONE for intensity < 33', () => {
      expect(IntensityZone.fromIntensity(Intensity.fromPercent(0))).toBe(IntensityZone.LOW_ZONE);
      expect(IntensityZone.fromIntensity(Intensity.fromPercent(32))).toBe(IntensityZone.LOW_ZONE);
    });

    it('should return MID_ZONE for intensity between 33 and 65', () => {
      expect(IntensityZone.fromIntensity(Intensity.fromPercent(33))).toBe(IntensityZone.MID_ZONE);
      expect(IntensityZone.fromIntensity(Intensity.fromPercent(65))).toBe(IntensityZone.MID_ZONE);
    });

    it('should return HIGH_ZONE for intensity >= 66', () => {
      expect(IntensityZone.fromIntensity(Intensity.fromPercent(66))).toBe(IntensityZone.HIGH_ZONE);
      expect(IntensityZone.fromIntensity(Intensity.fromPercent(100))).toBe(IntensityZone.HIGH_ZONE);
    });
  });

  describe('intensityBoundary()', () => {
    it('should return [0, 33] for LOW_ZONE', () => {
      expect(IntensityZone.LOW_ZONE.intensityBoundary()).toEqual([0, 33]);
    });

    it('should return [33, 66] for MID_ZONE', () => {
      expect(IntensityZone.MID_ZONE.intensityBoundary()).toEqual([33, 66]);
    });

    it('should return [66, 100] for HIGH_ZONE', () => {
      expect(IntensityZone.HIGH_ZONE.intensityBoundary()).toEqual([66, 100]);
    });
  });

  describe('isEquals()', () => {
    it('should correctly compare IntensityZone instances', () => {
      expect(IntensityZone.LOW_ZONE.isEquals(IntensityZone.LOW_ZONE)).toBe(true);
      expect(IntensityZone.LOW_ZONE.isEquals(IntensityZone.HIGH_ZONE)).toBe(false);
    });

    it('should correctly compare Intensity instances', () => {
      const i1 = Intensity.fromPercent(50);
      const i2 = Intensity.fromPercent(50);
      const i3 = Intensity.fromPercent(80);
      expect(i1.isEquals(i2)).toBe(true);
      expect(i1.isEquals(i3)).toBe(false);
    });
  });
});
