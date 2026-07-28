import { describe, it, expect, beforeEach } from 'vitest';
import { StartTestUseCase } from './StartTestUseCase';
import { BarfometerSession, SessionState } from '../domain/entities/BarfometerSession';
import { Zone } from '../domain/value-objects/Zone';

describe('StartTestUseCase', () => {
  let session: BarfometerSession;
  let useCase: StartTestUseCase;

  beforeEach(() => {
    session = new BarfometerSession();
    useCase = new StartTestUseCase(session);
  });

  it('should start the test in the session', () => {
    // Given: a session with a preset zone
    session.setPresetZone(Zone.GREEN);

    // When: the use case is executed
    useCase.execute();

    // Then: the session should transition to LISTENING
    expect(session.state).toBe(SessionState.LISTENING);
  });

  it('should throw an error if trying to start without a preset zone', () => {
    // Given: a session in IDLE state (no zone set)
    
    // When: the use case is executed
    
    // Then: it should throw an error
    expect(() => useCase.execute()).toThrow();
  });
});
