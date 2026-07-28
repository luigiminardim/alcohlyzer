import type { BarfometerSession } from '../domain/entities/BarfometerSession';
import type { SoundAnalyzerPort } from '../domain/ports/SoundAnalyzerPort';
import type { SoundData } from '../domain/ports/MicrophonePort';

/**
 * Use case: Processes incoming sound data during the LISTENING state.
 *
 * Responsibilities:
 * - Ask SoundAnalyzerPort if the current audio data constitutes a "blow"
 * - If yes, get intensity and register it with the session
 * - Return boolean indicating if a blow was detected
 */
export class ProcessBlowUseCase {
  constructor(
    private readonly session: BarfometerSession,
    private readonly soundAnalyzer: SoundAnalyzerPort,
  ) {}

  /**
   * @param soundData Current audio analysis frame
   * @param blowDurationMs How long the user has been blowing (measured externally)
   * @returns true if a blow was registered, false otherwise
   */
  execute(soundData: SoundData, blowDurationMs: number): boolean {
    if (!this.soundAnalyzer.isBlowDetected(soundData)) {
      return false;
    }

    const intensity = this.soundAnalyzer.getIntensity(soundData);
    this.session.registerBlow(intensity, blowDurationMs);

    return true;
  }
}
