import type { AlcohlyzerSession } from '../domain/entities/AlcohlyzerSession';
import type { IntensityZone } from '../domain/value-objects/IntensityZone';
import type { StoragePort } from '../domain/ports/StoragePort';

/**
 * Use case: Officer sets the preset zone for the next test.
 *
 * Responsibilities:
 * - Update the aggregate root (AlcohlyzerSession)
 * - Persist the chosen zone so it survives page reloads
 */
export class SetZoneUseCase {
  constructor(
    private readonly session: AlcohlyzerSession,
    private readonly storage: StoragePort,
  ) {}

  execute(zone: IntensityZone): void {
    this.session.setTarget(zone);
    this.storage.savePresetZone(zone);
  }
}
