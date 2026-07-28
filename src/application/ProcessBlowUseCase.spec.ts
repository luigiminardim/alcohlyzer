import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProcessBlowUseCase } from './ProcessBlowUseCase';
import { BarfometerSession, SessionState } from '../domain/entities/BarfometerSession';
import { Zone } from '../domain/value-objects/Zone';
import type { SoundAnalyzerPort } from '../domain/ports/SoundAnalyzerPort';
import type { SoundData } from '../domain/ports/MicrophonePort';

describe('ProcessBlowUseCase', () => {
  let session: BarfometerSession;
  let mockAnalyzer: SoundAnalyzerPort;
  let useCase: ProcessBlowUseCase;

  beforeEach(() => {
    session = new BarfometerSession();
    mockAnalyzer = {
      isBlowDetected: vi.fn(),
      getIntensity: vi.fn(),
    };
    useCase = new ProcessBlowUseCase(session, mockAnalyzer);
  });

  it('should return false and do nothing if no blow is detected', () => {
    // Given: a listening session and sound data that is NOT a blow
    session.setPresetZone(Zone.RED);
    session.startTest();
    
    const soundData: SoundData = { volume: 10, lowFreqEnergy: 20, timestamp: 1000 };
    vi.mocked(mockAnalyzer.isBlowDetected).mockReturnValue(false);

    // When: processing the sound data
    const result = useCase.execute(soundData, 2000); // 2000ms blow duration

    // Then: it should return false
    expect(result).toBe(false);
    
    // And: session should remain in LISTENING state
    expect(session.state).toBe(SessionState.LISTENING);
    expect(mockAnalyzer.getIntensity).not.toHaveBeenCalled();
  });

  it('should register a blow and return true if a blow is detected', () => {
    // Given: a listening session and sound data that IS a blow
    session.setPresetZone(Zone.RED);
    session.startTest();
    
    const soundData: SoundData = { volume: 80, lowFreqEnergy: 150, timestamp: 1000 };
    vi.mocked(mockAnalyzer.isBlowDetected).mockReturnValue(true);
    vi.mocked(mockAnalyzer.getIntensity).mockReturnValue(0.75);

    // When: processing the sound data
    const result = useCase.execute(soundData, 3500); // 3500ms blow duration

    // Then: it should return true
    expect(result).toBe(true);
    
    // And: session should transition to ANIMATING
    expect(session.state).toBe(SessionState.ANIMATING);
    
    // And: intensity should be calculated
    expect(mockAnalyzer.getIntensity).toHaveBeenCalledWith(soundData);
  });
});
