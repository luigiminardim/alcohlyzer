import { Observable } from 'rxjs';
import type { MeasurePort, PortMeasureEvent } from '../../domain/ports/MeasurePort';

const FFT_SIZE = 256;
const BLOW_DURATION_GOAL_MS = 1500;
/**
 * Thresholds for detecting a blow.
 * These may need tuning based on real device testing.
 */
const BLOW_VOLUME_THRESHOLD = 30; // Minimum average volume (lowered from 30)
const BLOW_LOW_FREQ_THRESHOLD = 150; // High energy in lowest frequency bins (the "puff" sound)
const BLOW_LOW_FREQ_RATIO_THRESHOLD = 0.04; // At least 4% of total energy must be in low frequencies

/** Number of low-frequency bins to sum for the "puff" signature. */
const LOW_FREQ_BIN_COUNT = 3;

// ---------------------------------------------------------------------------
// Frame Scheduler — abstraction over the polling loop (Open/Closed Principle)
// ---------------------------------------------------------------------------

type ScheduleCallback = (callback: (timestamp: number) => void) => number;
type CancelCallback = (handle: number) => void;

export interface FrameScheduler {
  schedule: ScheduleCallback;
  cancel: CancelCallback;
}

const RAF_SCHEDULER: FrameScheduler = {
  schedule: (cb) => requestAnimationFrame(cb),
  cancel: (id) => cancelAnimationFrame(id),
};

// ---------------------------------------------------------------------------
// Adapter
// ---------------------------------------------------------------------------

export class WebAudioMicrophoneAdapter implements MeasurePort {
  private readonly scheduler: FrameScheduler;

  /** Held so `stopMeasure()` can trigger cleanup from outside the Observable. */
  private cleanupFn: (() => void) | null = null;

  constructor(scheduler: FrameScheduler = RAF_SCHEDULER) {
    this.scheduler = scheduler;
  }

  listenMeasure(): Observable<PortMeasureEvent> {
    return new Observable<PortMeasureEvent>((subscriber) => {
      // --- mutable state scoped to this subscription ---
      let audioContext: AudioContext | null = null;
      let sourceNode: MediaStreamAudioSourceNode | null = null;
      let analyserNode: AnalyserNode | null = null;
      let stream: MediaStream | null = null;
      let rafId: number | null = null;
      let cleaned = false;

      let accumulatedMs = 0;
      let previousTimestamp: number | null = null;

      // Pre-allocated buffer — created once, reused every frame.
      let dataArray: Uint8Array<ArrayBuffer> | null = null;

      // --- idempotent cleanup ---
      const cleanup = (): void => {
        if (cleaned) return;
        cleaned = true;

        if (rafId !== null) {
          this.scheduler.cancel(rafId);
          rafId = null;
        }
        sourceNode?.disconnect();
        analyserNode?.disconnect();
        stream?.getTracks().forEach((t) => t.stop());
        void audioContext?.close();

        sourceNode = null;
        analyserNode = null;
        stream = null;
        audioContext = null;
        dataArray = null;
        this.cleanupFn = null;
      };

      // Expose cleanup so stopMeasure() can reach it.
      this.cleanupFn = cleanup;

      // --- analysis loop (called each scheduler tick) ---
      const tick = (timestamp: number): void => {
        if (cleaned || !analyserNode || !dataArray) return;

        const deltaMs = previousTimestamp === null ? 0 : timestamp - previousTimestamp;
        previousTimestamp = timestamp;

        // Read frequency data into the pre-allocated buffer.
        analyserNode.getByteFrequencyData(dataArray);

        const isBlowing = detectBlow(dataArray);

        // Fill / drain accumulator
        accumulatedMs += isBlowing ? deltaMs : -deltaMs;
        accumulatedMs = Math.max(0, Math.min(BLOW_DURATION_GOAL_MS, accumulatedMs));

        const measurePercent = (accumulatedMs / BLOW_DURATION_GOAL_MS) * 100;
        const isFinal = accumulatedMs >= BLOW_DURATION_GOAL_MS;

        subscriber.next({ isFinal, measurePercent });

        if (isFinal) {
          cleanup();
          subscriber.complete();
          return;
        }

        rafId = this.scheduler.schedule(tick);
      };

      // --- async initialisation ---
      initAudioPipeline()
        .then(({ ctx, source, analyser, mediaStream, buffer }) => {
          if (cleaned) {
            // Subscriber already unsubscribed while we were awaiting.
            source.disconnect();
            analyser.disconnect();
            mediaStream.getTracks().forEach((t) => t.stop());
            void ctx.close();
            return;
          }

          audioContext = ctx;
          sourceNode = source;
          analyserNode = analyser;
          stream = mediaStream;
          dataArray = buffer;

          // Kick off the loop.
          rafId = this.scheduler.schedule(tick);
        })
        .catch((err: unknown) => {
          cleanup();
          subscriber.error(err instanceof Error ? err : new Error(String(err)));
        });

      // Observable teardown — called on unsubscribe.
      return cleanup;
    });
  }

  stopMeasure(): void {
    this.cleanupFn?.();
  }
}

// ---------------------------------------------------------------------------
// Pure helpers (no side-effects, easy to test in isolation)
// ---------------------------------------------------------------------------

/**
 * Returns `true` when the frequency data matches a "blowing" profile:
 * average volume above threshold AND high energy in the lowest bins.
 */
function detectBlow(frequencyData: Uint8Array): boolean {
  const length = frequencyData.length;
  if (length === 0) return false;

  let totalEnergy = 0;
  let lowFreqEnergy = 0;

  for (let i = 0; i < length; i++) {
    const val = frequencyData[i] ?? 0;
    totalEnergy += val;
    if (i < LOW_FREQ_BIN_COUNT) {
      lowFreqEnergy += val;
    }
  }
  const averageVolume = totalEnergy / length;
  const lowFreqRatio = totalEnergy > 0 ? lowFreqEnergy / totalEnergy : 0;

  const isBlowing =
    averageVolume >= BLOW_VOLUME_THRESHOLD &&
    lowFreqEnergy >= BLOW_LOW_FREQ_THRESHOLD &&
    lowFreqRatio >= BLOW_LOW_FREQ_RATIO_THRESHOLD;

  console.info(JSON.stringify({ isBlowing, averageVolume, lowFreqEnergy, lowFreqRatio }));
  return isBlowing;
}

// ---------------------------------------------------------------------------
// Audio pipeline factory
// ---------------------------------------------------------------------------

interface AudioPipeline {
  ctx: AudioContext;
  source: MediaStreamAudioSourceNode;
  analyser: AnalyserNode;
  mediaStream: MediaStream;
  buffer: Uint8Array<ArrayBuffer>;
}

async function initAudioPipeline(): Promise<AudioPipeline> {
  const mediaStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
  });

  const ctx = new AudioContext();
  // Browsers may start the context in "suspended" state (autoplay policy).
  // A suspended context yields all-zero frequency data.
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
  const source = ctx.createMediaStreamSource(mediaStream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = FFT_SIZE;

  source.connect(analyser);
  // Intentionally NOT connecting analyser to destination — we only read data.

  const buffer = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));

  return { ctx, source, analyser, mediaStream, buffer };
}
