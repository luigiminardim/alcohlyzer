import { Observable } from 'rxjs';
import type { BarfometerSession, BarfometerMeasureEvent } from "../domain/entities/BarfometerSession";


/**
 * Use case: Orchestrates the breathalyzer test.
 *
 * Responsibilities:
 * - Starts the test on the session.
 * - Resolves to an Observable<BarfometerMeasureEvent> for UI subscription.
 */
export class TestBlowUseCase {
  constructor(
    private readonly session: BarfometerSession,
  ) {}

  execute(): Observable<BarfometerMeasureEvent> {
    // The session handles mapping the raw port event to the rigged BarfometerMeasureEvent
    return this.session.startTest();
  }
}
