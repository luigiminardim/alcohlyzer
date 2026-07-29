/**
 * Thresholds for detecting a blow. 
 * These may need tuning based on real device testing.
 */
const BLOW_VOLUME_THRESHOLD = 30; // Minimum average volume
const BLOW_LOW_FREQ_THRESHOLD = 150; // High energy in lowest frequency bins (the "puff" sound)

/**
 * Pure domain policy that determines if a blow is occurring
 * based on raw sound metrics.
 */
export class BlowDetectionBySoundPolicy {
  /**
   * Evaluates whether the given sound parameters represent a "blow".
   * 
   * @param volume The average volume of the sound frame
   * @param energy The low-frequency energy of the sound frame
   * @returns true if a blow is detected, false otherwise
   */
  evaluate(volume: number, energy: number): boolean {
    return volume > BLOW_VOLUME_THRESHOLD && energy > BLOW_LOW_FREQ_THRESHOLD;
  }
}
