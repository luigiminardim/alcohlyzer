import { describe, it, expect, vi, afterEach } from 'vitest';
import { BarfometerSession, SessionStatus } from './BarfometerSession';
import { IntensityZone } from '../value-objects/IntensityZone';
import type { MeasurePort, PortMeasureEvent } from '../ports/MeasurePort';
import { Observable, Subject } from 'rxjs';

describe('BarfometerSession', () => {
  describe('Initialization', () => {
    it('should start in IDLE state with default LOW_ZONE target', () => {
      const mockPort: MeasurePort = { listenMeasure: () => new Observable<PortMeasureEvent>(), stopMeasure: () => {} };
      const session = new BarfometerSession(mockPort);
      expect(session.state.status).toBe(SessionStatus.IDLE);
      expect(session.targetZone).toBe(IntensityZone.LOW_ZONE);
    });

    it('should initialize target zone if passed in constructor', () => {
      const mockPort: MeasurePort = { listenMeasure: () => new Observable<PortMeasureEvent>(), stopMeasure: () => {} };
      const session = new BarfometerSession(mockPort, IntensityZone.HIGH_ZONE);
      expect(session.state.status).toBe(SessionStatus.IDLE);
      expect(session.targetZone).toBe(IntensityZone.HIGH_ZONE);
    });

    it('should allow setting target zone while IDLE', () => {
      const mockPort: MeasurePort = { listenMeasure: () => new Observable<PortMeasureEvent>(), stopMeasure: () => {} };
      const session = new BarfometerSession(mockPort);
      session.setTarget(IntensityZone.MID_ZONE);
      expect(session.targetZone).toBe(IntensityZone.MID_ZONE);
    });

    it('should throw if setting target zone when not IDLE', () => {
      const mockPort: MeasurePort = {
        listenMeasure: () => new Observable<PortMeasureEvent>(),
        stopMeasure: () => {}
      };
      const session = new BarfometerSession(mockPort, IntensityZone.LOW_ZONE);
      session.startTest();
      expect(() => session.setTarget(IntensityZone.HIGH_ZONE)).toThrow(/Cannot set target zone/);
    });
  });

  describe('Test Execution', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should transition to TESTING when started', () => {
      const mockPort: MeasurePort = {
        listenMeasure: () => new Observable<PortMeasureEvent>(),
        stopMeasure: () => {}
      };
      const session = new BarfometerSession(mockPort, IntensityZone.LOW_ZONE);
      session.startTest();
      expect(session.state.status).toBe(SessionStatus.TESTING);
    });

    it('should stop and set state to result when port emits isFinal', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5); // Prevent jitter from crossing boundaries
      const subject = new Subject<PortMeasureEvent>();
      const mockPort: MeasurePort = {
        listenMeasure: () => subject.asObservable(),
        stopMeasure: () => {}
      };
      const session = new BarfometerSession(mockPort, IntensityZone.HIGH_ZONE);

      const observable = session.startTest();
      let lastEvent: any = null;
      observable.subscribe(e => lastEvent = e);

      // Port emits intermediate measure
      subject.next({ isFinal: false, measurePercent: 50 });
      expect(session.state.status).toBe(SessionStatus.TESTING);
      expect(lastEvent.isFinal).toBe(false);

      // Port emits final measure
      subject.next({ isFinal: true, measurePercent: 100 });
      
      // Should now transition to RESULT
      expect(session.state.status).toBe(SessionStatus.RESULT);
      expect(lastEvent.isFinal).toBe(true);
      expect(session.state.zone).toBe(IntensityZone.HIGH_ZONE);
      expect(session.state.intensity.percent).toBe(lastEvent.result.intensity.percent);
    });
  });
});
