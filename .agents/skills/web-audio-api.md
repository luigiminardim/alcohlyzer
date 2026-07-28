# Web Audio API & Microphone Access

## Purpose
Guidelines for implementing blow detection using the Web Audio API in the Barfometer project.

## Secure Context Requirement

Microphone access (`getUserMedia`) requires:
- **HTTPS** in production (GitHub Pages provides this)
- **localhost** works for development
- Testing on phone requires `ngrok` tunnel or deployed URL

## Implementation Pattern

### Port Interface (Domain layer)
```typescript
interface SoundData {
  readonly volume: number;
  readonly lowFreqEnergy: number;
  readonly timestamp: number;
}

interface MicrophonePort {
  requestAccess(): Promise<void>;
  startListening(onSoundData: (data: SoundData) => void): void;
  stopListening(): void;
  isListening(): boolean;
}
```

### Adapter (Infrastructure layer)
```typescript
class WebAudioMicrophoneAdapter implements MicrophonePort {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private animationFrameId: number = 0;

  async requestAccess(): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.audioContext = new AudioContext();
    const source = this.audioContext.createMediaStreamSource(this.stream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    source.connect(this.analyser);
  }

  startListening(onSoundData: (data: SoundData) => void): void {
    if (!this.analyser) throw new Error('Mic not initialized');
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const detect = () => {
      this.analyser!.getByteFrequencyData(dataArray);
      const volume = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
      const lowFreqEnergy = (dataArray[0] ?? 0) + (dataArray[1] ?? 0) + (dataArray[2] ?? 0);

      onSoundData({ volume, lowFreqEnergy, timestamp: performance.now() });
      this.animationFrameId = requestAnimationFrame(detect);
    };

    detect();
  }

  stopListening(): void {
    cancelAnimationFrame(this.animationFrameId);
    this.stream?.getTracks().forEach(track => track.stop());
    this.audioContext?.close();
    this.stream = null;
    this.audioContext = null;
    this.analyser = null;
  }

  isListening(): boolean {
    return this.analyser !== null;
  }
}
```

## Blow Detection Algorithm

### Sound Analyzer Port
```typescript
interface SoundAnalyzerPort {
  isBlowDetected(data: SoundData): boolean;
  getIntensity(data: SoundData): number;
}
```

### Detection logic
A "blow" is characterized by:
1. **Volume spike** above a threshold (general loudness)
2. **Low-frequency energy** spike (the "puff" sound has low-freq content)

```typescript
const VOLUME_THRESHOLD = 30;         // Adjust based on testing
const LOW_FREQ_THRESHOLD = 100;      // Low-frequency energy threshold

isBlowDetected(data: SoundData): boolean {
  return data.volume > VOLUME_THRESHOLD && data.lowFreqEnergy > LOW_FREQ_THRESHOLD;
}

getIntensity(data: SoundData): number {
  // Normalize volume to 0-1 range
  return Math.min(data.volume / 200, 1);
}
```

### Threshold calibration
- Thresholds are hardware-dependent (different mics = different levels)
- Start with conservative thresholds and adjust through testing
- Consider a brief "calibration" phase if needed

## Cleanup Best Practices

**Always** stop tracks and close the AudioContext when done:
```typescript
// In React hook
useEffect(() => {
  return () => {
    mic.stopListening(); // stops tracks, closes context
  };
}, [mic]);
```

This ensures:
- Microphone indicator light turns off
- System resources are freed
- No memory leaks from dangling audio nodes

## Testing

### Unit testing (domain + application)
- Mock `MicrophonePort` and `SoundAnalyzerPort` — no real mic needed
- Test blow detection logic with synthetic `SoundData`

### Manual testing
- Use Chrome DevTools → Sensors to simulate permissions
- Test on real phone with actual blowing for threshold calibration
