import type { BarfometerSession } from '../domain/entities/BarfometerSession';

/**
 * Use case: Resets the game state after a result has been shown.
 *
 * Responsibilities:
 * - Reset the BarfometerSession state machine
 */
export class ResetSessionUseCase {
  constructor(private readonly session: BarfometerSession) {}

  execute(): void {
    this.session.reset();
  }
}
