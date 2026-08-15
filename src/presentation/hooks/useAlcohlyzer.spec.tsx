import { act, renderHook, waitFor } from '@testing-library/react';
import { Observable } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PortMeasureEvent } from '../../domain/ports/MeasurePort';
import { IntensityZone } from '../../domain/value-objects/IntensityZone';
import { WebAudioMicrophoneAdapter } from '../../infrastructure/adapters/WebAudioMicrophoneAdapter';
import { UiState, useAlcohlyzer } from './useAlcohlyzer';

describe('useAlcohlyzer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should recover the session after microphone initialization fails', async () => {
    // Given: microphone initialization fails after the test has started
    const microphoneFailure = new Observable<PortMeasureEvent>((subscriber) => {
      queueMicrotask(() => subscriber.error(new Error('Microphone unavailable')));
    });
    vi.spyOn(WebAudioMicrophoneAdapter.prototype, 'listenMeasure').mockReturnValue(
      microphoneFailure,
    );
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { result } = renderHook(() => useAlcohlyzer());

    // When: the test reports the asynchronous microphone failure
    act(() => result.current.startTest());
    await waitFor(() => {
      expect(result.current.micError).toBe('Microphone unavailable');
    });

    // Then: both UI and domain are ready for the next action
    expect(result.current.state).toBe(UiState.IDLE);
    act(() => result.current.setZone(IntensityZone.HIGH_ZONE));
    expect(result.current.presetZone).toBe(IntensityZone.HIGH_ZONE);
  });
});
