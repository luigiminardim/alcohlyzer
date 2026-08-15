import { useState, useRef, useCallback } from 'react';
import { IntensityZone, ZoneStatus } from '../../domain/value-objects/IntensityZone';

// Maps zones to center angles (0 to 180 degrees)
const getZoneAngle = (zone: IntensityZone): number => {
  switch (zone.status) {
    case ZoneStatus.LOW:
      return 30; // Left third
    case ZoneStatus.MID:
      return 90; // Middle third
    case ZoneStatus.HIGH:
      return 150; // Right third
  }
};

export function useGaugeAnimation() {
  const [needleAngle, setNeedleAngle] = useState(0); // Starts pointing left (0 deg)
  const animationRef = useRef<number>(0);

  const snapToZone = useCallback((zone: IntensityZone | null) => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (!zone) {
      setNeedleAngle(0);
    } else {
      setNeedleAngle(getZoneAngle(zone));
    }
  }, []);

  const setAngleFromIntensity = useCallback((intensity: number) => {
    // Map 0-100% intensity to 0-180 degrees
    setNeedleAngle(Math.min(Math.max((intensity / 100) * 180, 0), 180));
  }, []);

  return {
    needleAngle,
    snapToZone,
    setAngleFromIntensity,
  };
}
