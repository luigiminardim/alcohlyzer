import { Observable } from 'rxjs';
import type { AlcohlyzerSession, AlcohlyzerMeasureEvent } from "../domain/entities/AlcohlyzerSession";


/**
 * Use case: Orchestrates the breathalyzer test.
 *
 * Responsibilities:
 * - Starts the test on the session.
 * - Resolves to an Observable<AlcohlyzerMeasureEvent> for UI subscription.
 */
export class TestBlowUseCase {
  constructor(
    private readonly session: AlcohlyzerSession,
  ) {}

  execute(): Observable<AlcohlyzerMeasureEvent> {
    // The session handles mapping the raw port event to the rigged AlcohlyzerMeasureEvent
    return this.session.startTest();
  }
}
