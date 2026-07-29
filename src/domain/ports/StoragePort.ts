import type { IntensityZone } from '../value-objects/IntensityZone';

/**
 * StoragePort abstracts persistence for user preferences and application state.
 */
export interface StoragePort {
  /**
   * Saves the officer's preset zone.
   * @param zone The zone to preset.
   */
  savePresetZone(zone: IntensityZone): void;

  /**
   * Loads the previously saved preset zone.
   * @returns The saved Zone or null if none exists.
   */
  loadPresetZone(): IntensityZone | null;

  /**
   * Saves the user's preferred language code (e.g., 'en', 'pt-BR').
   * @param lang Language code string.
   */
  saveLanguagePreference(lang: string): void;

  /**
   * Loads the previously saved language preference.
   * @returns The language code string or null if none exists.
   */
  loadLanguagePreference(): string | null;
}
