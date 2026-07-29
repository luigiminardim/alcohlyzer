import type { MicrophonePort } from '../../domain/ports/MicrophonePort';
import type { BlowDetectionBySoundPolicy } from '../../domain/policies/BlowDetectionBySoundPolicy';

/**
 * Adapter that implements MicrophonePort using the browser's Web Audio API.
 * Responsible for requesting access, setting up the AudioContext,
 * and continuously polling the AnalyserNode for audio data.
 */
export class WebAudioMicrophoneAdapter implements MicrophonePort {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private animationFrameId: number = 0;

  constructor(private readonly blowDetectionPolicy: BlowDetectionBySoundPolicy) {}

  async requestAccess(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Create context after user gesture/permission
      this.audioContext = new AudioContext();
      
      const source = this.audioContext.createMediaStreamSource(this.stream);
      this.analyser = this.audioContext.createAnalyser();
      
      // Use 256 for a good balance of performance and resolution
      this.analyser.fftSize = 256;
      source.connect(this.analyser);
    } catch (error) {
      this.cleanup();
      throw new Error(`Microphone access failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  startListening(onBlow: (isBlowing: boolean) => void): void {
    if (!this.analyser) {
      throw new Error('Microphone not initialized. Call requestAccess() first.');
    }

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const detect = () => {
      // Must use non-null assertion since we checked above, 
      // but ts complains in inner function
      const analyserNode = this.analyser;
      if (!analyserNode) return;

      analyserNode.getByteFrequencyData(dataArray);
      
      // Calculate overall volume (average of all frequencies)
      const volume = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
      
      // Calculate low frequency energy (bass frequencies, typical of blowing into mic)
      const lowFreqEnergy = (dataArray[0] ?? 0) + (dataArray[1] ?? 0) + (dataArray[2] ?? 0);

      const isBlowing = this.blowDetectionPolicy.evaluate(volume, lowFreqEnergy);
      onBlow(isBlowing);

      this.animationFrameId = requestAnimationFrame(detect);
    };

    detect();
  }

  stopListening(): void {
    this.cleanup();
  }

  isListening(): boolean {
    return this.analyser !== null;
  }

  private cleanup(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = 0;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.audioContext) {
      this.audioContext.close().catch(console.error);
      this.audioContext = null;
    }

    this.analyser = null;
  }
}
