import { Zone } from '../value-objects/Zone';
import { createBlowResult } from '../value-objects/BlowResult';
import type { BlowResult } from '../value-objects/BlowResult';

/**
 * The possible states of a BarfometerSession.
 */
export enum SessionState {
  /** Initial state. No zone set. */
  IDLE = 'IDLE',
  /** Officer has preset a zone. Ready for testing. */
  ZONE_SET = 'ZONE_SET',
  /** Microphone is active, waiting for blow. */
  LISTENING = 'LISTENING',
  /** Needle is wobbling after blow detected. */
  ANIMATING = 'ANIMATING',
  /** Final zone is displayed with charge message. */
  RESULT = 'RESULT',
}

/**
 * BarfometerSession is the aggregate root managing the state machine
 * for a single breathalyzer test cycle.
 *
 * State flow: IDLE → ZONE_SET → LISTENING → ANIMATING → RESULT → (reset) → ZONE_SET
 */
export class BarfometerSession {
  private _state: SessionState;
  private _presetZone: Zone | null;
  private _result: BlowResult | null = null;
  private _blowIntensity: number = 0;
  private _blowDurationMs: number = 0;

  constructor(savedZone?: Zone) {
    if (savedZone !== undefined) {
      this._state = SessionState.ZONE_SET;
      this._presetZone = savedZone;
    } else {
      this._state = SessionState.IDLE;
      this._presetZone = null;
    }
  }

  /** Current state of the session. */
  get state(): SessionState {
    return this._state;
  }

  /** The secretly selected zone (null if not yet set). */
  get presetZone(): Zone | null {
    return this._presetZone;
  }

  /** The blow result (null if test hasn't completed). */
  get result(): BlowResult | null {
    return this._result;
  }

  /**
   * Officer sets (or changes) the preset zone.
   * Transitions from IDLE or ZONE_SET → ZONE_SET.
   */
  setPresetZone(zone: Zone): void {
    if (this._state !== SessionState.IDLE && this._state !== SessionState.ZONE_SET) {
      throw new Error(`Cannot set zone in ${this._state} state`);
    }
    this._presetZone = zone;
    this._state = SessionState.ZONE_SET;
  }

  /**
   * Officer starts the test. Transitions ZONE_SET → LISTENING.
   * Requires a preset zone to be set first.
   */
  startTest(): void {
    if (this._presetZone === null) {
      throw new Error('Cannot start test without a preset zone');
    }
    if (this._state !== SessionState.ZONE_SET) {
      throw new Error(`Cannot start test in ${this._state} state`);
    }
    this._state = SessionState.LISTENING;
  }

  /**
   * Registers a detected blow with its intensity and duration.
   * Transitions LISTENING → ANIMATING.
   */
  registerBlow(intensity: number, durationMs: number): void {
    if (this._state !== SessionState.LISTENING) {
      throw new Error(`Cannot register blow in ${this._state} state`);
    }
    this._blowIntensity = intensity;
    this._blowDurationMs = durationMs;
    this._state = SessionState.ANIMATING;
  }

  /**
   * Called when the wobble animation finishes.
   * Transitions ANIMATING → RESULT, creating the BlowResult.
   */
  completeAnimation(): void {
    if (this._state !== SessionState.ANIMATING) {
      throw new Error(`Cannot complete animation in ${this._state} state`);
    }
    if (this._presetZone === null) {
      throw new Error('Invariant violation: preset zone is null during animation');
    }

    this._result = createBlowResult({
      zone: this._presetZone,
      intensity: this._blowIntensity,
      durationMs: this._blowDurationMs,
    });
    this._state = SessionState.RESULT;
  }

  /**
   * Resets the session for the next guest.
   * Preserves the preset zone, clears the result.
   * Transitions any state → ZONE_SET (if zone was set) or IDLE.
   */
  reset(): void {
    this._result = null;
    this._blowIntensity = 0;
    this._blowDurationMs = 0;
    this._state = this._presetZone !== null ? SessionState.ZONE_SET : SessionState.IDLE;
  }
}
