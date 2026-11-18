import { useSyncExternalStore } from 'react';
import { browserStorage, createStore, safeRead, safeWrite } from '../lib/persistentStore';
import { LANG_STORAGE_KEY, detectLang, type Lang } from './lang';
import { messages, type Messages } from './messages';

function applyToDocument(lang: Lang): void {
  if (typeof document !== 'undefined') document.documentElement.lang = lang;
}

const initial = detectLang(
  safeRead(browserStorage(), LANG_STORAGE_KEY),
  typeof navigator === 'undefined' ? undefined : navigator.language,
);
applyToDocument(initial);

export const langStore = createStore<Lang>(initial, (lang) => {
  applyToDocument(lang);
  safeWrite(browserStorage(), LANG_STORAGE_KEY, lang);
});

export function setLang(lang: Lang): void {
  langStore.set(lang);
}

export function useLang(): Lang {
  return useSyncExternalStore(langStore.subscribe, langStore.get, langStore.get);
}

/** The UI copy for the current language. */
export function useT(): Messages {
  return messages[useLang()];
}
