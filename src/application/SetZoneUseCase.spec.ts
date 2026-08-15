import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SetZoneUseCase } from './SetZoneUseCase';
import { AlcohlyzerSession, SessionStatus } from '../domain/entities/AlcohlyzerSession';
import { IntensityZone } from '../domain/value-objects/IntensityZone';
import type { StoragePort } from '../domain/ports/StoragePort';

describe('SetZoneUseCase', () => {
  let session: AlcohlyzerSession;
  let mockStorage: StoragePort;
  let useCase: SetZoneUseCase;

  beforeEach(() => {
    const mockPort = { listenMeasure: vi.fn(), stopMeasure: vi.fn() } as any;
    session = new AlcohlyzerSession(mockPort);
    mockStorage = {
      savePresetZone: vi.fn(),
      loadPresetZone: vi.fn(),
      saveLanguagePreference: vi.fn(),
      loadLanguagePreference: vi.fn(),
    };
    useCase = new SetZoneUseCase(session, mockStorage);
  });

  it('should set the target zone in the session and save it to storage', () => {
    // Given: an idle session and a valid zone
    const targetZone = IntensityZone.HIGH_ZONE;

    // When: the use case is executed
    useCase.execute(targetZone);

    // Then: session should be updated
    expect(session.targetZone).toBe(targetZone);
    expect(session.state.status).toBe(SessionStatus.IDLE); // Stays IDLE

    // And: the storage port should be called to persist it
    expect(mockStorage.savePresetZone).toHaveBeenCalledWith(targetZone);
    expect(mockStorage.savePresetZone).toHaveBeenCalledTimes(1);
  });
});
