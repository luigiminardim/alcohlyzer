import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBlowUseCase } from './TestBlowUseCase';
import { BarfometerSession, SessionState } from '../domain/entities/BarfometerSession';
import { Zone } from '../domain/value-objects/Zone';
import type { MicrophonePort } from '../domain/ports/MicrophonePort';

describe('TestBlowUseCase', () => {
  let session: BarfometerSession;
  let microphonePort: MicrophonePort;
  let useCase: TestBlowUseCase;
  let abortController: AbortController;
  
  const mockNow = vi.fn();
  
  beforeEach(() => {
    session = new BarfometerSession(Zone.RED);
    
    microphonePort = {
      requestAccess: vi.fn(),
      startListening: vi.fn(),
      stopListening: vi.fn(),
      isListening: vi.fn().mockReturnValue(false),
    };
    
    useCase = new TestBlowUseCase(session, microphonePort);
    abortController = new AbortController();
    
    vi.stubGlobal('performance', { now: mockNow });
    vi.spyOn(Math, 'random').mockReturnValue(0.5); // Predictable random for target generation and jitter
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should stream fake progress and resolve after 2 seconds with target intensity', async () => {
    const onBlowProgress = vi.fn();
    
    let blowCallback: (isBlowing: boolean) => void;
    vi.mocked(microphonePort.startListening).mockImplementation((onBlow) => {
      blowCallback = onBlow;
    });

    const promise = useCase.execute({ 
      stopSignal: abortController.signal,
      onBlowProgress
    });

    // Target for RED zone with Math.random() = 0.5 is:
    // min: 0.8, max: 1.0 -> 0.8 + 0.5 * 0.2 = 0.9

    // Simulate continuous blowing in 100ms increments
    for (let i = 0; i < 20; i++) {
      mockNow.mockReturnValue(1000 + i * 100);
      blowCallback!(true); 
    }
    
    // Reach the 2000ms goal
    mockNow.mockReturnValue(3000);
    blowCallback!(true);

    const result = await promise;

    expect(onBlowProgress).toHaveBeenCalledTimes(20); // 0 to 19 (20th is exact 2000ms, which resolves without firing progress)
    
    // The 19th frame (1900ms) has progress = 1900/2000 = 0.95
    // baseValue = 0.95 * 0.9 = 0.855
    // jitter = (0.5 - 0.5) * 0.04 = 0
    expect(onBlowProgress).toHaveBeenLastCalledWith({ percent: 85.5 });
    
    expect(session.state).toBe(SessionState.ANIMATING);
    expect(microphonePort.stopListening).toHaveBeenCalled();
    expect(result).toEqual({
      percent: 90, // target intensity 0.9 * 100
      range: Zone.RED,
    });
  });

  it('should reset the timer if there is an interruption > 250ms', async () => {
    const onBlowProgress = vi.fn();
    
    let blowCallback: (isBlowing: boolean) => void;
    vi.mocked(microphonePort.startListening).mockImplementation((onBlow) => {
      blowCallback = onBlow;
    });

    const promise = useCase.execute({ stopSignal: abortController.signal, onBlowProgress });

    // First burst: 1000ms (10 frames)
    for (let i = 0; i <= 10; i++) {
      mockNow.mockReturnValue(1000 + i * 100);
      blowCallback!(true);
    }
    
    // Interruption (isBlowing = false at 2301)
    mockNow.mockReturnValue(2301);
    blowCallback!(false); // Resets firstBlowTime because 2301 - 2000 > 250

    // Second burst: Reach the new 2000ms goal from 3000 -> 5000
    for (let i = 0; i < 20; i++) {
      mockNow.mockReturnValue(3000 + i * 100);
      blowCallback!(true); 
    }
    
    mockNow.mockReturnValue(5000);
    blowCallback!(true);

    const result = await promise;

    expect(result?.percent).toBe(90);
  });

  it('should abort and resolve with null when stopSignal is triggered', async () => {
    mockNow.mockReturnValue(1000);
    
    let blowCallback: (isBlowing: boolean) => void;
    vi.mocked(microphonePort.startListening).mockImplementation((onBlow) => {
      blowCallback = onBlow;
    });

    const promise = useCase.execute({ stopSignal: abortController.signal });
    
    blowCallback!(true); // Start blowing
    
    // Abort before 2 seconds
    abortController.abort();
    
    const result = await promise;
    
    expect(microphonePort.stopListening).toHaveBeenCalled();
    expect(result).toBeNull();
  });
});
