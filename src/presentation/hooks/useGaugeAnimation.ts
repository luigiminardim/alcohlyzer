import { useState, useRef, useCallback } from 'react';
import { IntensityZone, ZoneStatus } from '../../domain/value-objects/IntensityZone';
import type { Intensity } from '../../domain/value-objects/Intensity';

// Maps zones to center angles (0 to 180 degrees)
const getZoneAngle = (zone: IntensityZone): number => {
  switch (zone.status) {
    case ZoneStatus.LOW: return 30;    // Left third
    case ZoneStatus.MID: return 90;    // Middle third
    case ZoneStatus.HIGH: return 150;  // Right third
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

  const animateWobble = useCallback((targetZone: IntensityZone, intensity: Intensity, onComplete: () => void) => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    const targetAngle = getZoneAngle(targetZone);
    const durationMs = 3000 + (intensity.percent / 100) * 4000; // 3 to 7 seconds based on intensity
    
    const startTime = performance.now();
    const maxAmplitude = 60; // Max wobble amplitude in degrees

    const frame = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1.0);

      if (progress < 1.0) {
        // Amplitude decreases as we get closer to the end
        const amplitude = maxAmplitude * (1 - progress);
        
        // Fast oscillation frequency
        const frequency = 25; 
        
        // Base moves slowly toward target, wobble is added on top
        const baseAngle = targetAngle * progress; 
        const wobble = Math.sin(progress * frequency) * amplitude;
        
        setNeedleAngle(baseAngle + wobble);
        animationRef.current = requestAnimationFrame(frame);
      } else {
        // Snap exactly to target when done
        setNeedleAngle(targetAngle);
        onComplete();
      }
    };

    animationRef.current = requestAnimationFrame(frame);
  }, []);

  return {
    needleAngle,
    snapToZone,
    animateWobble,
  };
}
