import { useState, useMemo, useCallback, useRef } from 'react';
import { BarfometerSession, SessionState } from '../../domain/entities/BarfometerSession';
import { LocalStorageAdapter } from '../../infrastructure/adapters/LocalStorageAdapter';
import { WebAudioMicrophoneAdapter } from '../../infrastructure/adapters/WebAudioMicrophoneAdapter';
import { AnalyserNodeSoundAdapter } from '../../infrastructure/adapters/AnalyserNodeSoundAdapter';
import { SetZoneUseCase } from '../../application/SetZoneUseCase';
import { StartTestUseCase } from '../../application/StartTestUseCase';
import { ProcessBlowUseCase } from '../../application/ProcessBlowUseCase';
import { ResetSessionUseCase } from '../../application/ResetSessionUseCase';
import { Zone } from '../../domain/value-objects/Zone';
import type { BlowResult } from '../../domain/value-objects/BlowResult';
import { useMicrophone } from './useMicrophone';

export function useBarfometer() {
  // 1. Dependency Injection / Composition Root
  const storage = useMemo(() => new LocalStorageAdapter(), []);
  const micAdapter = useMemo(() => new WebAudioMicrophoneAdapter(), []);
  const soundAdapter = useMemo(() => new AnalyserNodeSoundAdapter(), []);

  // 2. Aggregate Root (Instantiated once)
  const sessionRef = useRef<BarfometerSession | null>(null);
  if (!sessionRef.current) {
    const savedZone = storage.loadPresetZone() || undefined;
    sessionRef.current = new BarfometerSession(savedZone);
  }
  const session = sessionRef.current;

  // 3. Use Cases
  const setZoneUseCase = useMemo(() => new SetZoneUseCase(session, storage), [session, storage]);
  const startTestUseCase = useMemo(() => new StartTestUseCase(session), [session]);
  const processBlowUseCase = useMemo(() => new ProcessBlowUseCase(session, soundAdapter), [session, soundAdapter]);
  const resetSessionUseCase = useMemo(() => new ResetSessionUseCase(session), [session]);

  // 4. React State (syncs with Domain State)
  // We mirror the session state into React to trigger re-renders
  const [state, setState] = useState<SessionState>(session.state);
  const [presetZone, setPresetZone] = useState<Zone | null>(session.presetZone);
  const [result, setResult] = useState<BlowResult | null>(session.result);
  
  // Track start of blow for duration calculation
  const testStartTimeRef = useRef<number>(0);

  // 5. Hooks
  const { requestAccess, startListening, stopListening, error: micError } = useMicrophone(micAdapter);

  // 6. Action Handlers (Bridging React to Use Cases)
  const handleSetZone = useCallback((zone: Zone) => {
    setZoneUseCase.execute(zone);
    setState(session.state);
    setPresetZone(session.presetZone);
  }, [setZoneUseCase, session]);

  const handleStartTest = useCallback(async () => {
    try {
      await requestAccess(); // Ask for mic permission
      
      startTestUseCase.execute();
      setState(session.state);
      
      testStartTimeRef.current = performance.now();
      
      // Start listening to sound data and passing it to the use case
      startListening((soundData) => {
        const blowDurationMs = performance.now() - testStartTimeRef.current;
        const blowDetected = processBlowUseCase.execute(soundData, blowDurationMs);
        
        if (blowDetected) {
          stopListening(); // Stop mic as soon as blow is registered
          setState(session.state); // State is now ANIMATING
        }
      });
    } catch (err) {
      console.error('Failed to start test:', err);
    }
  }, [requestAccess, startTestUseCase, startListening, processBlowUseCase, stopListening, session]);

  const handleAnimationComplete = useCallback(() => {
    session.completeAnimation();
    setState(session.state);
    setResult(session.result);
  }, [session]);

  const handleReset = useCallback(() => {
    resetSessionUseCase.execute();
    setState(session.state);
    setResult(null);
  }, [resetSessionUseCase, session]);

  return {
    state,
    presetZone,
    result,
    micError,
    setZone: handleSetZone,
    startTest: handleStartTest,
    completeAnimation: handleAnimationComplete,
    reset: handleReset,
  };
}
