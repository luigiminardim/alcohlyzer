import type { BarfometerSession } from "../domain/entities/BarfometerSession";
import type { MicrophonePort } from "../domain/ports/MicrophonePort";
import { Zone } from "../domain/value-objects/Zone";

export interface TestBlowInputDTO {
  stopSignal: AbortSignal;
  /** Callback fired continuously while the user is blowing */
  onBlowProgress?: (data: { percent: number }) => void;
}

export type TestBlowOutputDTO = null | {
  targetPercent: number;
  zone: Zone;
};

const BLOW_CONTINUOUS_DURATION_MS = 2000; // 2 seconds
const BLOW_INTERRUPT_THRESHOLD_MS = 250; // max pause allowed

function getTargetLimitsForZone(zone: Zone): { min: number; max: number } {
  switch (zone) {
    case Zone.GREEN:
      return { min: 0.1, max: 0.3 };
    case Zone.YELLOW:
      return { min: 0.4, max: 0.65 };
    case Zone.RED:
      return { min: 0.8, max: 1.0 };
  }
}

/**
 * Use case: Orchestrates the breathalyzer test.
 *
 * Responsibilities:
 * - Starts the test on the session.
 * - Starts listening to the microphone for a blow.
 * - Streams a FAKE intermediate blow intensity to the UI based on the preset Zone.
 * - When 2 seconds of continuous blowing is achieved, registers it and resolves.
 * - Handles cancellation via an AbortSignal.
 */
export class TestBlowUseCase {
  constructor(
    private readonly session: BarfometerSession,
    private readonly microphone: MicrophonePort,
  ) {}

  async execute(input: TestBlowInputDTO): Promise<TestBlowOutputDTO> {
    this.session.startTest();

    const presetZone = this.session.presetZone;
    if (!presetZone) {
      return null;
    }

    if (input.stopSignal.aborted) {
      return null;
    }

    return new Promise((resolve, reject) => {
      let firstBlowTime = 0;
      let lastBlowTime = 0;
      let targetIntensity = 0;

      const internalAbort = new AbortController();

      const cleanup = () => {
        input.stopSignal.removeEventListener("abort", onExternalAbort);
      };

      const onExternalAbort = () => {
        internalAbort.abort();
        cleanup();
        resolve(null);
      };

      input.stopSignal.addEventListener("abort", onExternalAbort, { once: true });

      this.microphone
        .listen(({ isBlowing }) => {
          const now = performance.now();

          if (!isBlowing) {
            // If the user stopped blowing for too long, reset the timer
            if (
              firstBlowTime > 0 &&
              now - lastBlowTime > BLOW_INTERRUPT_THRESHOLD_MS
            ) {
              firstBlowTime = 0;
            }
            return;
          }

          // --- From here, isBlowing is TRUE ---

          if (firstBlowTime === 0) {
            firstBlowTime = now;
            // Determine the final fake target intensity based on the preset zone
            const limits = getTargetLimitsForZone(presetZone);
            targetIntensity =
              limits.min + Math.random() * (limits.max - limits.min);
          }

          lastBlowTime = now;
          const elapsed = now - firstBlowTime;

          if (elapsed >= BLOW_CONTINUOUS_DURATION_MS) {
            internalAbort.abort();
            cleanup();
            this.session.registerBlow(targetIntensity, elapsed);

            resolve({
              targetPercent: targetIntensity * 100,
              zone: presetZone,
            });
          } else {
            // Calculate an artificial progress intensity with a bit of random jitter
            const progress = elapsed / BLOW_CONTINUOUS_DURATION_MS;
            const baseValue = progress * targetIntensity;

            // Add up to ±2% jitter to make the needle wobble realistically
            const jitter = (Math.random() - 0.5) * 0.04;
            const fakeIntensity = Math.max(0, Math.min(1, baseValue + jitter));

            if (input.onBlowProgress) {
              input.onBlowProgress({ percent: fakeIntensity * 100 });
            }
          }
        }, internalAbort.signal)
        .catch((err) => {
          cleanup();
          reject(err);
        });
    });
  }
}
