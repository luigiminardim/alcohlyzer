import type { MicrophonePort } from "../../domain/ports/MicrophonePort";
import type { BlowDetectionBySoundPolicy } from "../../domain/policies/BlowDetectionBySoundPolicy";

const DEBUG_LOOPBACK = true;

const FFT_SIZE = 256;

/**
 * Adapter that implements MicrophonePort using the browser's Web Audio API.
 * Responsible for requesting access, setting up the AudioContext,
 * and continuously polling the AnalyserNode for audio data.
 */
export class WebAudioMicrophoneAdapter implements MicrophonePort {
  constructor(
    private readonly blowDetectionPolicy: BlowDetectionBySoundPolicy,
  ) {}

  async listen(
    onBlow: (data: { isBlowing: boolean }) => void,
    stopSignal: AbortSignal
  ): Promise<void> {
    if (stopSignal.aborted) {
      return;
    }

    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let stream: MediaStream | null = null;
    let animationFrameId: number = 0;

    const cleanup = async () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = 0;
      }

      if (audioContext && audioContext.state !== 'closed') {
        try {
          await audioContext.suspend();
          await audioContext.close();
        } catch (e) {
          console.error("AudioContext close error:", e);
        }
        audioContext = null;
      }

      if (stream) {
        stream.getTracks().forEach((track) => {
          track.enabled = false;
          track.stop();
        });
        stream = null;
      }

      analyser = null;
      stopSignal.removeEventListener("abort", cleanup);
    };

    stopSignal.addEventListener("abort", cleanup);

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      if (DEBUG_LOOPBACK) {
        let audio = document.getElementById(
          "debug-loopback-audio",
        ) as HTMLAudioElement | null;

        // Remove old element if it exists (useful for HMR)
        if (audio) {
          audio.remove();
        }

        audio = document.createElement("audio");
        audio.id = "debug-loopback-audio";
        audio.controls = true;
        audio.autoplay = true;
        audio.style.position = "fixed";
        audio.style.bottom = "10px";
        audio.style.right = "10px";
        audio.style.zIndex = "9999";
        document.body.appendChild(audio);

        audio.srcObject = stream;
        // Explicitly play it and catch any autoplay policy errors
        audio.play().catch((e) => console.error("Audio play error:", e));
      }

      // Create context after user gesture/permission
      audioContext = new AudioContext();

      const source = audioContext.createMediaStreamSource(stream);
      analyser = audioContext.createAnalyser();

      // Use FFT_SIZE for a good balance of performance and resolution
      analyser.fftSize = FFT_SIZE;
      source.connect(analyser);
    } catch (error) {
      cleanup();
      throw new Error(
        `Microphone access failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const detect = () => {
      if (!analyser) return;

      analyser.getByteFrequencyData(dataArray);

      // Calculate overall volume (average of all frequencies)
      const volume =
        dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;

      // Calculate low frequency energy (bass frequencies, typical of blowing into mic)
      const lowFreqEnergy =
        (dataArray[0] ?? 0) + (dataArray[1] ?? 0) + (dataArray[2] ?? 0);

      const isBlowing = this.blowDetectionPolicy.evaluate(
        volume,
        lowFreqEnergy,
      );
      
      onBlow({ isBlowing });

      animationFrameId = requestAnimationFrame(detect);
    };

    detect();
  }
}
