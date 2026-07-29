import { Observable } from "rxjs";
import type {
  MeasurePort,
  PortMeasureEvent,
} from "../../domain/ports/MeasurePort";

const FFT_SIZE = 256;
const BLOW_DURATION_GOAL_MS = 2000;
/**
 * Thresholds for detecting a blow.
 * These may need tuning based on real device testing.
 */
const BLOW_VOLUME_THRESHOLD = 30; // Minimum average volume
const BLOW_LOW_FREQ_THRESHOLD = 150; // High energy in lowest frequency bins (the "puff" sound)

export class WebAudioMicrophoneAdapter implements MeasurePort {
  private activeCleanup: (() => void) | null = null;

  listenMeasure(): Observable<PortMeasureEvent> {
    return new Observable<PortMeasureEvent>((subscriber) => {
      let audioContext: AudioContext | null = null;
      let analyser: AnalyserNode | null = null;
      let source: MediaStreamAudioSourceNode | null = null;
      let stream: MediaStream | null = null;
      let animationFrameId: number = 0;
      let isCleanedUp = false;

      let accumulatedMs = 0;
      let lastTime = performance.now();

      const cleanup = async () => {
        if (isCleanedUp) return;
        isCleanedUp = true;

        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = 0;
        }

        if (source) {
          source.disconnect();
          source = null;
        }

        if (audioContext && audioContext.state !== "closed") {
          const ctx = audioContext;
          audioContext = null;
          try {
            await ctx.close();
          } catch (e: any) {
            if (e?.name !== "InvalidStateError") {
              console.error("AudioContext close error:", e);
            }
          }
        }

        if (stream) {
          stream.getTracks().forEach((track) => {
            track.enabled = false;
            track.stop();
          });
          stream = null;
        }

        analyser = null;
      };

      this.activeCleanup = cleanup;

      navigator.mediaDevices
        .getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        })
        .then((mediaStream) => {
          if (isCleanedUp) {
            mediaStream.getTracks().forEach((track) => track.stop());
            return;
          }

          stream = mediaStream;

          audioContext = new AudioContext();
          if (audioContext.state === "suspended") {
            audioContext
              .resume()
              .catch((e) => console.error("AudioContext resume error:", e));
          }
          source = audioContext.createMediaStreamSource(stream);
          analyser = audioContext.createAnalyser();
          analyser.fftSize = FFT_SIZE;
          source.connect(analyser);

          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          const detect = () => {
            if (!analyser) return;

            analyser.getByteFrequencyData(dataArray);

            const volume =
              dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
            const lowFreqEnergy =
              (dataArray[0] ?? 0) + (dataArray[1] ?? 0) + (dataArray[2] ?? 0);

            const isBlowing =
              volume > BLOW_VOLUME_THRESHOLD &&
              lowFreqEnergy > BLOW_LOW_FREQ_THRESHOLD;

            const now = performance.now();
            const elapsed = now - lastTime;
            lastTime = now;

            if (isBlowing) {
              accumulatedMs += elapsed;
            } else {
              accumulatedMs -= elapsed;
            }

            // Clamp accumulated time between 0 and goal
            accumulatedMs = Math.max(
              0,
              Math.min(accumulatedMs, BLOW_DURATION_GOAL_MS),
            );

            const isFinal = accumulatedMs >= BLOW_DURATION_GOAL_MS;

            subscriber.next({
              isFinal,
              measurePercent: (100 * accumulatedMs) / BLOW_DURATION_GOAL_MS,
            });

            if (!isFinal) {
              animationFrameId = requestAnimationFrame(detect);
            } else {
              cleanup();
              subscriber.complete();
            }
          };

          // Reset time tracking right before starting loop
          lastTime = performance.now();
          detect();
        })
        .catch((error) => {
          cleanup();
          subscriber.error(
            new Error(
              `Microphone access failed: ${error instanceof Error ? error.message : String(error)}`,
            ),
          );
        });

      return () => {
        cleanup();
        this.activeCleanup = null;
      };
    });
  }

  stopMeasure(): void {
    if (this.activeCleanup) {
      this.activeCleanup();
      this.activeCleanup = null;
    }
  }
}
