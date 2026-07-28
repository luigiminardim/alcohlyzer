/**
 * Zone represents one of three result regions on the barfometer gauge.
 * Each zone maps to a charge level for the wedding guest.
 */
export enum Zone {
  GREEN = 'GREEN',
  YELLOW = 'YELLOW',
  RED = 'RED',
}

/** All valid zones as a readonly array. */
export const ZONES: readonly Zone[] = [Zone.GREEN, Zone.YELLOW, Zone.RED] as const;

/**
 * Returns the i18n-compatible label key for a zone.
 * These keys map to translation files (e.g., `result.clean`).
 */
export function getZoneLabel(zone: Zone): string {
  switch (zone) {
    case Zone.GREEN:
      return 'clean';
    case Zone.YELLOW:
      return 'smallCharge';
    case Zone.RED:
      return 'bigCharge';
    default: {
      /* v8 ignore next 3 */
      const _exhaustive: never = zone;
      throw new Error(`Unknown zone: ${String(_exhaustive)}`);
    }
  }
}

/**
 * Returns the hex color associated with a zone for rendering.
 */
export function getZoneColor(zone: Zone): string {
  switch (zone) {
    case Zone.GREEN:
      return '#4CAF50';
    case Zone.YELLOW:
      return '#FFC107';
    case Zone.RED:
      return '#F44336';
    default: {
      /* v8 ignore next 3 */
      const _exhaustive: never = zone;
      throw new Error(`Unknown zone: ${String(_exhaustive)}`);
    }
  }
}
