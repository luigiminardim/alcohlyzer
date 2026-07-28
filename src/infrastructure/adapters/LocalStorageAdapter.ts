import type { StoragePort } from '../../domain/ports/StoragePort';
import { Zone } from '../../domain/value-objects/Zone';

const ZONE_STORAGE_KEY = 'barfometer_preset_zone';
const LANG_STORAGE_KEY = 'barfometer_language';

/**
 * Adapter that implements StoragePort using window.localStorage.
 */
export class LocalStorageAdapter implements StoragePort {
  savePresetZone(zone: Zone): void {
    try {
      localStorage.setItem(ZONE_STORAGE_KEY, zone);
    } catch (e) {
      console.warn('Failed to save preset zone to localStorage', e);
    }
  }

  loadPresetZone(): Zone | null {
    try {
      const stored = localStorage.getItem(ZONE_STORAGE_KEY);
      if (stored && Object.values(Zone).includes(stored as Zone)) {
        return stored as Zone;
      }
    } catch (e) {
      console.warn('Failed to load preset zone from localStorage', e);
    }
    return null;
  }

  saveLanguagePreference(lang: string): void {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch (e) {
      console.warn('Failed to save language to localStorage', e);
    }
  }

  loadLanguagePreference(): string | null {
    try {
      return localStorage.getItem(LANG_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to load language from localStorage', e);
    }
    return null;
  }
}
