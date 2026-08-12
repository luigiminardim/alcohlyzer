import { describe, it, expect } from 'vitest';
import { TestBlowUseCase } from './TestBlowUseCase';
import { AlcohlyzerSession, SessionStatus } from '../domain/entities/AlcohlyzerSession';
import { IntensityZone } from '../domain/value-objects/IntensityZone';
import type { MeasurePort, PortMeasureEvent } from '../domain/ports/MeasurePort';
import { Subject } from 'rxjs';

describe('TestBlowUseCase', () => {
  it('should return an observable that maps to fake percent and delegates to session', () => {
    const subject = new Subject<PortMeasureEvent>();
    const mockPort: MeasurePort = { listenMeasure: () => subject.asObservable(), stopMeasure: () => {} };
    const session = new AlcohlyzerSession(mockPort, IntensityZone.HIGH_ZONE);
    const useCase = new TestBlowUseCase(session);

    const observable = useCase.execute();
    
    let lastPercent = 0;
    observable.subscribe((event) => {
      lastPercent = event.result.intensity.percent;
    });

    // Emulate port time tracking
    subject.next({ isFinal: false, measurePercent: 10 }); 

    // Because it's rigged, after 10% it should be around 10% of target
    expect(lastPercent).toBeGreaterThan(0);
    expect(lastPercent).toBeLessThan(20); // Just checking it didn't jump to 100

    subject.next({ isFinal: true, measurePercent: 100 });

    // Should be completed and reached HIGH zone
    expect(session.state.status).toBe(SessionStatus.RESULT);
    expect(session.state.zone).toBe(IntensityZone.HIGH_ZONE);
  });
});
