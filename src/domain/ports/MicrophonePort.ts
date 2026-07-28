export interface SoundData {
  readonly volume: number;
  readonly lowFreqEnergy: number;
  readonly timestamp: number;
}

/**
 * MicrophonePort abstracts the browser's microphone access (Web Audio API/getUserMedia).
 * It provides a way to start listening to the microphone and emitting sound data.
 */
export interface MicrophonePort {
  /**
   * Requests permission to access the microphone.
   * Resolves if granted, rejects if denied or unavailable.
   */
  requestAccess(): Promise<void>;

  /**
   * Starts listening and processing audio data.
   * Calls the provided callback repeatedly with current sound data.
   * @param onSoundData Callback invoked with current audio levels
   */
  startListening(onSoundData: (data: SoundData) => void): void;

  /**
   * Stops listening and releases microphone resources.
   */
  stopListening(): void;

  /**
   * Returns true if currently listening.
   */
  isListening(): boolean;
}
