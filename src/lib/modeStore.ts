import { useSyncExternalStore } from 'react';
import { MODE_STORAGE_KEY, PAGE_BACKGROUND, otherMode, parseMode, type ColorMode } from './mode';
import { REDUCED_MOTION_QUERY } from './gsap';
import { browserStorage, createStore, safeRead, safeWrite } from './persistentStore';

/** data-mode drives the tokens, color-scheme the native controls and
 * scrollbars, theme-color the browser chrome. */
function applyToDocument(mode: ColorMode): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.dataset.mode = mode;
  root.style.colorScheme = mode;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', PAGE_BACKGROUND[mode]);
}

/** Matches --dur-mode in tokens.css, plus a little slack for the last frame. */
const CROSSFADE_MS = 300;
let crossfadeTimer: ReturnType<typeof setTimeout> | undefined;

/** Turns on the colour cross-fade rules in tokens.css for one switch. Set in
 * the same task as data-mode, so the new colours transition rather than snap.
 * Skipped under reduced motion. */
function crossfade(): void {
  if (typeof window === 'undefined' || window.matchMedia(REDUCED_MOTION_QUERY).matches) return;
  const root = document.documentElement;
  root.dataset.modeSwitching = '';
  clearTimeout(crossfadeTimer);
  crossfadeTimer = setTimeout(() => delete root.dataset.modeSwitching, CROSSFADE_MS);
}

const initial = parseMode(safeRead(browserStorage(), MODE_STORAGE_KEY));
// index.html already set this before first paint; repeated here so the DOM
// and the store can never disagree
applyToDocument(initial);

export const modeStore = createStore<ColorMode>(initial, (mode) => {
  crossfade();
  applyToDocument(mode);
  safeWrite(browserStorage(), MODE_STORAGE_KEY, mode);
});

export function setMode(mode: ColorMode): void {
  modeStore.set(mode);
}

export function toggleMode(): void {
  modeStore.set(otherMode(modeStore.get()));
}

export function useMode(): ColorMode {
  return useSyncExternalStore(modeStore.subscribe, modeStore.get, modeStore.get);
}
