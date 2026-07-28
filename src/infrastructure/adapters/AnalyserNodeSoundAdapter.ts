import type { SoundAnalyzerPort } from '../../domain/ports/SoundAnalyzerPort';
import type { SoundData } from '../../domain/ports/MicrophonePort';

/**
 * Thresholds for detecting a blow. 
 * These may need tuning based on real device testing.
 */
const BLOW_VOLUME_THRESHOLD = 30; // Minimum average volume
const BLOW_LOW_FREQ_THRESHOLD = 150; // High energy in lowest frequency bins (the "puff" sound)

/**
 * Adapter that analyzes sound data to detect blows.
 */
export class AnalyserNodeSoundAdapter implements SoundAnalyzerPort {
  isBlowDetected(data: SoundData): boolean {
    return data.volume > BLOW_VOLUME_THRESHOLD && data.lowFreqEnergy > BLOW_LOW_FREQ_THRESHOLD;
  }

  getIntensity(data: SoundData): number {
    // Normalize volume to a 0.0 - 1.0 scale.
    // 200 is an arbitrary max volume for normalization (max is technically 255 but rarely reached)
    return Math.min(data.volume / 200, 1.0);
  }
}
