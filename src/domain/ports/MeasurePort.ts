import { Observable } from 'rxjs';

export interface PortMeasureEvent {
  isFinal: boolean;
  measurePercent: number; // accumulated time in seconds
}

/**
 * MeasurePort abstracts the browser's microphone access (Web Audio API/getUserMedia).
 * It provides a way to start listening to the microphone and emitting blow events.
 */
export interface MeasurePort {
  /**
   * Starts listening to the microphone and processing audio data.
   * Returns an Observable that emits continuous measurements.
   */
  listenMeasure(): Observable<PortMeasureEvent>;

  /**
   * Stops the ongoing measure and releases hardware locks.
   */
  stopMeasure(): void;
}
