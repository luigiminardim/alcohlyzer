import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  BarfometerSession,
  SessionState,
} from "../../domain/entities/BarfometerSession";
import { LocalStorageAdapter } from "../../infrastructure/adapters/LocalStorageAdapter";
import { WebAudioMicrophoneAdapter } from "../../infrastructure/adapters/WebAudioMicrophoneAdapter";
import { BlowDetectionBySoundPolicy } from "../../domain/policies/BlowDetectionBySoundPolicy";
import { SetZoneUseCase } from "../../application/SetZoneUseCase";
import { TestBlowUseCase } from "../../application/TestBlowUseCase";
import { ResetSessionUseCase } from "../../application/ResetSessionUseCase";
import { Zone } from "../../domain/value-objects/Zone";
import type { BlowResult } from "../../domain/value-objects/BlowResult";

export function useBarfometer() {
  // 1. Dependency Injection / Composition Root
  const storage = useMemo(() => new LocalStorageAdapter(), []);
  const soundAdapter = useMemo(() => new BlowDetectionBySoundPolicy(), []);
  const micAdapter = useMemo(
    () => new WebAudioMicrophoneAdapter(soundAdapter),
    [soundAdapter],
  );

  // 2. Aggregate Root (Instantiated once)
  const sessionRef = useRef<BarfometerSession | null>(null);
  if (!sessionRef.current) {
    const savedZone = storage.loadPresetZone() || undefined;
    sessionRef.current = new BarfometerSession(savedZone);
  }
  const session = sessionRef.current;

  // 3. Use Cases
  const setZoneUseCase = useMemo(
    () => new SetZoneUseCase(session, storage),
    [session, storage],
  );
  const testBlowUseCase = useMemo(
    () => new TestBlowUseCase(session, micAdapter),
    [session, micAdapter],
  );
  const resetSessionUseCase = useMemo(
    () => new ResetSessionUseCase(session),
    [session],
  );

  // 4. React State (syncs with Domain State)
  // We mirror the session state into React to trigger re-renders
  const [state, setState] = useState<SessionState>(session.state);
  const [presetZone, setPresetZone] = useState<Zone | null>(session.presetZone);
  const [result, setResult] = useState<BlowResult | null>(session.result);
  const [currentIntensity, setCurrentIntensity] = useState<number>(0);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // 5. State
  const [micError, setMicError] = useState<string | null>(null);

  // 6. Action Handlers (Bridging React to Use Cases)
  const handleSetZone = useCallback(
    (zone: Zone) => {
      setZoneUseCase.execute(zone);
      setState(session.state);
      setPresetZone(session.presetZone);
    },
    [setZoneUseCase, session],
  );

  const handleStartTest = useCallback(async () => {
    try {
      setMicError(null);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      setCurrentIntensity(0);

      const promise = testBlowUseCase.execute({
        stopSignal: abortControllerRef.current.signal,
        onBlowProgress: (data) => setCurrentIntensity(data.percent),
      });

      setState(session.state); // Trigger re-render for LISTENING state

      const resultDto = await promise;

      if (resultDto) {
        setState(session.state); // State is now ANIMATING
      }
    } catch (err) {
      console.error("Failed to start test:", err);
      setMicError(err instanceof Error ? err.message : String(err));
    }
  }, [testBlowUseCase, session]);

  const handleAnimationComplete = useCallback(() => {
    session.completeAnimation();
    setState(session.state);
    setResult(session.result);
  }, [session]);

  const handleReset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    resetSessionUseCase.execute();
    setState(session.state);
    setResult(null);
    setCurrentIntensity(0);
  }, [resetSessionUseCase, session]);

  return {
    state,
    presetZone,
    result,
    currentIntensity,
    micError,
    setZone: handleSetZone,
    startTest: handleStartTest,
    completeAnimation: handleAnimationComplete,
    reset: handleReset,
  };
}
