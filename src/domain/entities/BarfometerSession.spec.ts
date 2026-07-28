import { describe, it, expect } from 'vitest';
import { BarfometerSession, SessionState } from './BarfometerSession';
import { Zone } from '../value-objects/Zone';

describe('BarfometerSession', () => {
  describe('Zone Setup (Officer)', () => {
    it('should start in IDLE state', () => {
      // Given: a new session

      // When: created without arguments
      const session = new BarfometerSession();

      // Then: it should be in IDLE state with no preset zone
      expect(session.state).toBe(SessionState.IDLE);
      expect(session.presetZone).toBeNull();
    });

    it('should allow setting a preset zone', () => {
      // Given: a new session in IDLE state
      const session = new BarfometerSession();

      // When: the officer sets a preset zone
      session.setPresetZone(Zone.RED);

      // Then: the preset zone should be set
      expect(session.presetZone).toBe(Zone.RED);
    });

    it('should transition to ZONE_SET state after zone is set', () => {
      // Given: a new session in IDLE state
      const session = new BarfometerSession();

      // When: a zone is preset
      session.setPresetZone(Zone.GREEN);

      // Then: the state should transition to ZONE_SET
      expect(session.state).toBe(SessionState.ZONE_SET);
    });

    it('should allow changing the preset zone while in ZONE_SET state', () => {
      // Given: a session with a preset zone
      const session = new BarfometerSession();
      session.setPresetZone(Zone.GREEN);

      // When: the officer changes the zone
      session.setPresetZone(Zone.RED);

      // Then: the zone should be updated
      expect(session.presetZone).toBe(Zone.RED);
      expect(session.state).toBe(SessionState.ZONE_SET);
    });

    it('should restore a previously saved zone on creation', () => {
      // Given: a saved zone from a previous session

      // When: a session is created with a saved zone
      const session = new BarfometerSession(Zone.YELLOW);

      // Then: it should start in ZONE_SET state with the saved zone
      expect(session.state).toBe(SessionState.ZONE_SET);
      expect(session.presetZone).toBe(Zone.YELLOW);
    });
  });

  describe('Test Execution (Blower)', () => {
    it('should transition to LISTENING when test is started', () => {
      // Given: a session with a preset zone
      const session = new BarfometerSession();
      session.setPresetZone(Zone.RED);

      // When: the officer starts the test
      session.startTest();

      // Then: the state should transition to LISTENING
      expect(session.state).toBe(SessionState.LISTENING);
    });

    it('should not start test without a preset zone', () => {
      // Given: a session in IDLE state (no zone set)
      const session = new BarfometerSession();

      // When: attempting to start the test

      // Then: it should throw an error
      expect(() => session.startTest()).toThrow();
    });

    it('should transition to ANIMATING when blow is registered', () => {
      // Given: a session in LISTENING state
      const session = new BarfometerSession();
      session.setPresetZone(Zone.YELLOW);
      session.startTest();

      // When: a blow is registered with intensity and duration
      session.registerBlow(0.7, 3000);

      // Then: the state should transition to ANIMATING
      expect(session.state).toBe(SessionState.ANIMATING);
    });

    it('should not register blow when not in LISTENING state', () => {
      // Given: a session in ZONE_SET state (not listening)
      const session = new BarfometerSession();
      session.setPresetZone(Zone.RED);

      // When: attempting to register a blow

      // Then: it should throw an error
      expect(() => session.registerBlow(0.5, 2000)).toThrow();
    });
  });

  describe('Result', () => {
    it('should transition to RESULT after animation is completed', () => {
      // Given: a session in ANIMATING state
      const session = new BarfometerSession();
      session.setPresetZone(Zone.RED);
      session.startTest();
      session.registerBlow(0.8, 4000);

      // When: the animation completes
      session.completeAnimation();

      // Then: the state should transition to RESULT
      expect(session.state).toBe(SessionState.RESULT);
    });

    it('should always land on the preset zone', () => {
      // Given: a session preset to RED
      const session = new BarfometerSession();
      session.setPresetZone(Zone.RED);
      session.startTest();
      session.registerBlow(0.5, 2000);
      session.completeAnimation();

      // When: getting the result

      // Then: the result zone should be the preset zone
      expect(session.result).not.toBeNull();
      expect(session.result?.zone).toBe(Zone.RED);
    });

    it('should include blow intensity and duration in the result', () => {
      // Given: a session with a blow
      const session = new BarfometerSession();
      session.setPresetZone(Zone.GREEN);
      session.startTest();
      session.registerBlow(0.6, 3500);
      session.completeAnimation();

      // When: checking the result

      // Then: it should contain the blow data
      expect(session.result).not.toBeNull();
      expect(session.result?.intensity).toBe(0.6);
      expect(session.result?.durationMs).toBe(3500);
    });
  });

  describe('Error States', () => {
    it('should throw when setting zone in invalid state', () => {
      const session = new BarfometerSession();
      session.setPresetZone(Zone.RED);
      session.startTest(); // state is now LISTENING
      expect(() => session.setPresetZone(Zone.GREEN)).toThrow(/Cannot set zone in LISTENING state/);
    });

    it('should throw when starting test in invalid state', () => {
      const session = new BarfometerSession();
      session.setPresetZone(Zone.RED);
      session.startTest(); // state is now LISTENING
      expect(() => session.startTest()).toThrow(/Cannot start test in LISTENING state/);
    });

    it('should throw when completing animation in invalid state', () => {
      const session = new BarfometerSession();
      expect(() => session.completeAnimation()).toThrow(/Cannot complete animation in IDLE state/);
    });

    it('should throw when completing animation but preset zone is magically null', () => {
      const session = new BarfometerSession();
      session.setPresetZone(Zone.RED);
      session.startTest();
      session.registerBlow(0.5, 2000);
      
      // Force internal state violation for coverage
      (session as any)._presetZone = null;
      expect(() => session.completeAnimation()).toThrow(/Invariant violation/);
    });
  });

  describe('Reset', () => {
    it('should transition back to ZONE_SET on reset (preserving preset)', () => {
      // Given: a session in RESULT state
      const session = new BarfometerSession();
      session.setPresetZone(Zone.YELLOW);
      session.startTest();
      session.registerBlow(0.5, 2000);
      session.completeAnimation();

      // When: the officer resets
      session.reset();

      // Then: state should be ZONE_SET with the same preset zone
      expect(session.state).toBe(SessionState.ZONE_SET);
      expect(session.presetZone).toBe(Zone.YELLOW);
    });

    it('should transition to IDLE on reset if no preset zone was ever set', () => {
      // Given: a new session in IDLE state
      const session = new BarfometerSession();

      // When: reset is called
      session.reset();

      // Then: it should remain IDLE
      expect(session.state).toBe(SessionState.IDLE);
      expect(session.presetZone).toBeNull();
    });

    it('should clear the blow result on reset', () => {
      // Given: a session in RESULT state
      const session = new BarfometerSession();
      session.setPresetZone(Zone.RED);
      session.startTest();
      session.registerBlow(0.8, 4000);
      session.completeAnimation();

      // When: the officer resets
      session.reset();

      // Then: the result should be cleared
      expect(session.result).toBeNull();
    });
  });
});
