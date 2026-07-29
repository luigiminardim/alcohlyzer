/**
 * MicrophonePort abstracts the browser's microphone access (Web Audio API/getUserMedia).
 * It provides a way to start listening to the microphone and emitting blow events.
 */
export interface MicrophonePort {
  /**
   * Starts listening to the microphone and processing audio data.
   * Requests microphone access if not already granted.
   * Allocates resources when called and frees them when stopSignal is aborted.
   * Resolves when listening has successfully started and stops when the stopSignal is aborted.
   * 
   * @param onBlow Callback invoked continuously with data indicating if user is blowing
   * @param stopSignal Signal to abort and cleanup resources
   */
  listen(
    onBlow: (data: { isBlowing: boolean }) => void,
    stopSignal: AbortSignal
  ): Promise<void>;
}
