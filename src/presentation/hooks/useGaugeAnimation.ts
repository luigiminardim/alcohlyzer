import { useState, useRef, useCallback } from 'react';
import { Zone } from '../../domain/value-objects/Zone';

// Maps zones to center angles (0 to 180 degrees)
const ZONE_ANGLES: Record<Zone, number> = {
  [Zone.GREEN]: 30,    // Left third
  [Zone.YELLOW]: 90,   // Middle third
  [Zone.RED]: 150,     // Right third
};

export function useGaugeAnimation() {
  const [needleAngle, setNeedleAngle] = useState(0); // Starts pointing left (0 deg)
  const animationRef = useRef<number>(0);

  const snapToZone = useCallback((zone: Zone | null) => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (!zone) {
      setNeedleAngle(0);
    } else {
      setNeedleAngle(ZONE_ANGLES[zone]);
    }
  }, []);

  const animateWobble = useCallback((targetZone: Zone, durationMs: number, onComplete: () => void) => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    const targetAngle = ZONE_ANGLES[targetZone];
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
