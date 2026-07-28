import type { BarfometerSession } from '../domain/entities/BarfometerSession';

/**
 * Use case: Officer initiates the test, activating the microphone.
 *
 * Responsibilities:
 * - Trigger state transition on BarfometerSession
 */
export class StartTestUseCase {
  constructor(private readonly session: BarfometerSession) {}

  execute(): void {
    this.session.startTest();
  }
}
