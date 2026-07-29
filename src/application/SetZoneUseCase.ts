import type { BarfometerSession } from '../domain/entities/BarfometerSession';
import type { IntensityZone } from '../domain/value-objects/IntensityZone';
import type { StoragePort } from '../domain/ports/StoragePort';

/**
 * Use case: Officer sets the preset zone for the next test.
 *
 * Responsibilities:
 * - Update the aggregate root (BarfometerSession)
 * - Persist the chosen zone so it survives page reloads
 */
export class SetZoneUseCase {
  constructor(
    private readonly session: BarfometerSession,
    private readonly storage: StoragePort,
  ) {}

  execute(zone: IntensityZone): void {
    this.session.setTarget(zone);
    this.storage.savePresetZone(zone);
  }
}
