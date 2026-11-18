import { useSyncExternalStore } from 'react';
import { accentStorageKey, findAccent, resolveAccent, type AccentId, type AccentPalette } from './accent';
import { modeStore } from './modeStore';
import { browserStorage, createStore, safeRead, safeWrite } from './persistentStore';
import type { ColorMode } from './mode';

function applyToDocument(id: AccentId): void {
  if (typeof document !== 'undefined') document.documentElement.dataset.accent = id;
}

/** The accent saved for `mode`, or that mode's default. */
function savedAccent(mode: ColorMode): AccentId {
  return resolveAccent(mode, safeRead(browserStorage(), accentStorageKey(mode)));
}

const initial = savedAccent(modeStore.get());
// index.html already set this before first paint; repeated here so the DOM
// and the store can never disagree
applyToDocument(initial);

/** Holds the active accent of the active mode; each mode persists its own. */
export const accentStore = createStore<AccentId>(initial, (id) => {
  applyToDocument(id);
  safeWrite(browserStorage(), accentStorageKey(modeStore.get()), id);
});

// Switching mode restores that mode's own accent. Subscribed at module load,
// so it runs before any component listener and they all see a consistent pair.
modeStore.subscribe(() => accentStore.set(savedAccent(modeStore.get())));

export function setAccent(id: AccentId): void {
  accentStore.set(id);
}

export function useAccent(): AccentId {
  return useSyncExternalStore(accentStore.subscribe, accentStore.get, accentStore.get);
}

export function currentPalette(): AccentPalette {
  return findAccent(accentStore.get());
}
