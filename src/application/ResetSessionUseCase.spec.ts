import { describe, it, expect, beforeEach } from 'vitest';
import { ResetSessionUseCase } from './ResetSessionUseCase';
import { BarfometerSession, SessionState } from '../domain/entities/BarfometerSession';
import { Zone } from '../domain/value-objects/Zone';

describe('ResetSessionUseCase', () => {
  let session: BarfometerSession;
  let useCase: ResetSessionUseCase;

  beforeEach(() => {
    session = new BarfometerSession();
    useCase = new ResetSessionUseCase(session);
  });

  it('should reset the session', () => {
    // Given: a session with a completed test
    session.setPresetZone(Zone.YELLOW);
    session.startTest();
    session.registerBlow(0.5, 2000);
    session.completeAnimation();
    
    expect(session.state).toBe(SessionState.RESULT);

    // When: the use case is executed
    useCase.execute();

    // Then: the session should be reset
    expect(session.state).toBe(SessionState.ZONE_SET);
    expect(session.result).toBeNull();
  });
});
