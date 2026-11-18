/** Supported languages and the pure helpers around them. The live store
 * (current language, setLang, useLang, useT) is in langStore.ts. */

export type Lang = 'en' | 'es';
export const LANGS: readonly Lang[] = ['en', 'es'];
export const LANG_STORAGE_KEY = 'arben:lang';

/** A value that exists once per supported language. */
export type Localized<T> = Readonly<Record<Lang, T>>;

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (LANGS as readonly string[]).includes(value);
}

/** The saved choice when valid; otherwise Spanish for Spanish-speaking
 * browsers and English for everyone else. */
export function detectLang(saved: string | null, browserLanguage: string | undefined): Lang {
  if (isLang(saved)) return saved;
  return browserLanguage?.toLowerCase().startsWith('es') ? 'es' : 'en';
}

/** Replaces each `{name}` in `template` with `values.name`. */
export function formatMessage(template: string, values: Readonly<Record<string, string | number>>): string {
  return template.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    name in values ? String(values[name]) : placeholder,
  );
}
