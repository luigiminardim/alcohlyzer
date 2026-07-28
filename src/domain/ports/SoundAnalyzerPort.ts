import type { SoundData } from './MicrophonePort';

/**
 * SoundAnalyzerPort abstracts the logic to analyze sound data
 * to detect a "blow" and determine its intensity.
 */
export interface SoundAnalyzerPort {
  /**
   * Determines if the given sound data represents a "blow"
   * (e.g., based on volume and low-frequency energy).
   * @param data The sound data to analyze
   * @returns true if a blow is detected, false otherwise
   */
  isBlowDetected(data: SoundData): boolean;

  /**
   * Calculates the normalized intensity (0.0 to 1.0) of a blow
   * from the given sound data.
   * @param data The sound data to analyze
   * @returns A value between 0.0 and 1.0 representing intensity
   */
  getIntensity(data: SoundData): number;
}
