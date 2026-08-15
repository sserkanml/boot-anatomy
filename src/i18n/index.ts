export type Language = 'en' | 'tr';

/**
 * A string that exists in both languages.
 *
 * Technical terms are deliberately *not* localized anywhere in this project —
 * PS_ON#, PWR_OK, rail, bootloader, kernel, chipset, MOSFET and friends stay in
 * English inside Turkish prose, which is how they are actually written and said.
 * Only explanatory language is translated.
 */
export interface Localized {
  en: string;
  tr: string;
}

export const LANGUAGES: Array<{ id: Language; label: string; title: string }> = [
  { id: 'en', label: 'EN', title: 'English' },
  { id: 'tr', label: 'TR', title: 'Türkçe' },
];

const STORAGE_KEY = 'boot-anatomy:language';

function detect(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'tr') return stored;
  } catch {
    // Storage can be unavailable in private mode; fall through to the browser.
  }
  return navigator.language?.toLowerCase().startsWith('tr') ? 'tr' : 'en';
}

let current: Language = detect();
const listeners = new Set<(language: Language) => void>();

export function getLanguage(): Language {
  return current;
}

export function setLanguage(language: Language): void {
  if (language === current) return;
  current = language;

  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // Preference simply does not persist if storage is blocked.
  }

  document.documentElement.lang = language;
  for (const listener of [...listeners]) listener(language);
}

/** Subscribes to language changes; the returned function unsubscribes. */
export function onLanguageChange(listener: (language: Language) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Resolves a localized string. Plain strings pass through untouched, which is
 * what keeps technical labels and console output out of the translation layer.
 */
export function t(value: Localized | string): string {
  return typeof value === 'string' ? value : value[current];
}

/** Applies the stored preference to the document on startup. */
export function initLanguage(): void {
  document.documentElement.lang = current;
}
