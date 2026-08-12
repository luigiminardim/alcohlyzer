import type { AlcohlyzerSession } from '../domain/entities/AlcohlyzerSession';

/**
 * Use case: Resets the game state after a result has been shown.
 *
 * Responsibilities:
 * - Reset the AlcohlyzerSession state machine
 */
export class ResetSessionUseCase {
  constructor(private readonly session: AlcohlyzerSession) {}

  execute(): void {
    this.session.reset();
  }
}
