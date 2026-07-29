import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  BarfometerSession,
} from "../../domain/entities/BarfometerSession";
import { LocalStorageAdapter } from "../../infrastructure/adapters/LocalStorageAdapter";
import { WebAudioMicrophoneAdapter } from "../../infrastructure/adapters/WebAudioMicrophoneAdapter";
import { SetZoneUseCase } from "../../application/SetZoneUseCase";
import { TestBlowUseCase } from "../../application/TestBlowUseCase";
import { ResetSessionUseCase } from "../../application/ResetSessionUseCase";
import { IntensityZone } from "../../domain/value-objects/IntensityZone";
import type { Intensity } from "../../domain/value-objects/Intensity";
import type { BarfometerMeasureEvent } from "../../domain/entities/BarfometerSession";
import { Subscription } from "rxjs";

export enum UiState {
  IDLE = "IDLE",
  LISTENING = "LISTENING",
  RESULT = "RESULT",
}

export function useBarfometer() {
  const storage = useMemo(() => new LocalStorageAdapter(), []);
  const micAdapter = useMemo(() => new WebAudioMicrophoneAdapter(), []);

  const sessionRef = useRef<BarfometerSession | null>(null);
  if (!sessionRef.current) {
    const savedZone = storage.loadPresetZone() || undefined;
    sessionRef.current = new BarfometerSession(micAdapter, savedZone);
  }
  const session = sessionRef.current;

  const setZoneUseCase = useMemo(
    () => new SetZoneUseCase(session, storage),
    [session, storage],
  );
  const testBlowUseCase = useMemo(
    () => new TestBlowUseCase(session),
    [session],
  );
  const resetSessionUseCase = useMemo(
    () => new ResetSessionUseCase(session),
    [session],
  );

  const [uiState, setUiState] = useState<UiState>(UiState.IDLE);
  const [targetZone, setTargetZone] = useState<IntensityZone | null>(
    session.targetZone,
  );
  const [measuredZone, setMeasuredZone] = useState<IntensityZone | null>(
    session.state.zone,
  );
  const [measuredIntensity, setMeasuredIntensity] = useState<Intensity | null>(
    session.state.intensity.percent > 0 ? session.state.intensity : null,
  );
  const [currentIntensity, setCurrentIntensity] = useState<number>(0);
  const [micError, setMicError] = useState<string | null>(null);

  const subscriptionRef = useRef<Subscription | null>(null);

  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, []);

  const handleSetZone = useCallback(
    (zone: IntensityZone) => {
      setZoneUseCase.execute(zone);
      setTargetZone(session.targetZone);
    },
    [setZoneUseCase, session],
  );

  const handleStartTest = useCallback(() => {
    try {
      setMicError(null);
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      setCurrentIntensity(0);

      const observable = testBlowUseCase.execute();
      setUiState(UiState.LISTENING);

      subscriptionRef.current = observable.subscribe({
        next: (event: BarfometerMeasureEvent) => {
          setCurrentIntensity(event.result.intensity.percent);

          if (event.isFinal) {
            setMeasuredZone(event.result.zone);
            setMeasuredIntensity(event.result.intensity);
            setUiState(UiState.RESULT);
            subscriptionRef.current?.unsubscribe();
          }
        },
        error: (err) => {
          console.error("Failed to execute test:", err);
          setMicError(err instanceof Error ? err.message : String(err));
          setUiState(UiState.IDLE);
        },
        complete: () => {
          // Stream completed
        },
      });
    } catch (err) {
      console.error("Failed to start test:", err);
      setMicError(err instanceof Error ? err.message : String(err));
      setUiState(UiState.IDLE);
    }
  }, [testBlowUseCase, uiState]);



  const handleReset = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }
    resetSessionUseCase.execute();
    setUiState(UiState.IDLE);
    setMeasuredZone(null);
    setMeasuredIntensity(null);
    setCurrentIntensity(0);
  }, [resetSessionUseCase]);

  return {
    state: uiState,
    presetZone: targetZone,
    measuredZone,
    measuredIntensity,
    currentIntensity,
    micError,
    setZone: handleSetZone,
    startTest: handleStartTest,
    reset: handleReset,
  };
}
