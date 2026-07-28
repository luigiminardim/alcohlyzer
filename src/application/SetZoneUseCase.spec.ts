import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SetZoneUseCase } from './SetZoneUseCase';
import { BarfometerSession, SessionState } from '../domain/entities/BarfometerSession';
import { Zone } from '../domain/value-objects/Zone';
import type { StoragePort } from '../domain/ports/StoragePort';

describe('SetZoneUseCase', () => {
  let session: BarfometerSession;
  let mockStorage: StoragePort;
  let useCase: SetZoneUseCase;

  beforeEach(() => {
    session = new BarfometerSession();
    mockStorage = {
      savePresetZone: vi.fn(),
      loadPresetZone: vi.fn(),
      saveLanguagePreference: vi.fn(),
      loadLanguagePreference: vi.fn(),
    };
    useCase = new SetZoneUseCase(session, mockStorage);
  });

  it('should set the zone in the session and save it to storage', () => {
    // Given: an idle session and a valid zone
    const targetZone = Zone.RED;

    // When: the use case is executed
    useCase.execute(targetZone);

    // Then: session should be updated
    expect(session.presetZone).toBe(targetZone);
    expect(session.state).toBe(SessionState.ZONE_SET);

    // And: the storage port should be called to persist it
    expect(mockStorage.savePresetZone).toHaveBeenCalledWith(targetZone);
    expect(mockStorage.savePresetZone).toHaveBeenCalledTimes(1);
  });
});
