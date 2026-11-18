/** Colour mode (dark/light) and the pure helpers around it. The live store
 * (current mode, setMode, useMode) is in modeStore.ts. */

export type ColorMode = 'dark' | 'light';

/** Dark is the site's identity, so it is the default. */
export const MODES: readonly ColorMode[] = ['dark', 'light'];
export const DEFAULT_MODE: ColorMode = 'dark';
/** Keep in sync with the pre-paint script in index.html. */
export const MODE_STORAGE_KEY = 'arben:mode';

/** --bg-page of each mode in tokens.css; also used for <meta name="theme-color">. */
export const PAGE_BACKGROUND: Readonly<Record<ColorMode, string>> = {
  dark: '#060708',
  light: '#F7F8FA',
};

export function isColorMode(value: unknown): value is ColorMode {
  return typeof value === 'string' && (MODES as readonly string[]).includes(value);
}

/** A stored mode, validated — storage is user-editable, so never trust it. */
export function parseMode(raw: string | null): ColorMode {
  const value = raw?.trim().toLowerCase();
  return isColorMode(value) ? value : DEFAULT_MODE;
}

export function otherMode(mode: ColorMode): ColorMode {
  return mode === 'dark' ? 'light' : 'dark';
}
