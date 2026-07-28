# ADR-004: Web Audio Blow Detection

## Status
Accepted

## Context
The barfometer needs to detect when a guest blows into the phone microphone. The detection must work in real-time and provide intensity data to drive the needle animation duration.

## Decision
Use the **Web Audio API** with `getUserMedia` + `AnalyserNode` for blow detection. The analysis runs on the main thread using `requestAnimationFrame`.

## Consequences
### Positive
- Native browser API — no external library needed
- `AnalyserNode` provides frequency domain data for distinguishing blows from speech/noise
- Real-time intensity data drives proportional animation duration
- Works on all modern browsers (Chrome, Safari, Firefox)

### Negative
- Requires HTTPS (localhost works for dev, GitHub Pages for production)
- Detection thresholds are hardware-dependent (different mics produce different levels)
- User must grant microphone permission (browser prompt)
- `AnalyserNode` analysis runs on main thread (acceptable for our simple use case)

## Implementation Details
- Port: `MicrophonePort` (domain interface)
- Adapter: `WebAudioMicrophoneAdapter` (infrastructure)
- Analysis: `SoundAnalyzerPort` determines if current audio data represents a blow
- Blow detected when: volume > threshold AND low-frequency energy > threshold
- Intensity normalized to 0-1 based on volume level

## Alternatives Considered
- **AudioWorklet**: Moves processing off main thread but adds complexity. Not needed for our simple analysis.
- **Simple button press**: Simpler but loses the fun "blow into the phone" experience
- **External library (e.g., Meyda)**: Feature-rich audio analysis but unnecessary dependency for volume detection
