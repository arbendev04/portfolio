import { describe, expect, it } from 'vitest';
import { detectLang, formatMessage, isLang } from './lang';

describe('isLang', () => {
  it('accepts the supported languages only', () => {
    expect(isLang('en')).toBe(true);
    expect(isLang('es')).toBe(true);
    expect(isLang('fr')).toBe(false);
    expect(isLang(null)).toBe(false);
  });
});

describe('detectLang', () => {
  it('prefers a valid saved choice over the browser language', () => {
    expect(detectLang('en', 'es-CO')).toBe('en');
    expect(detectLang('es', 'en-US')).toBe('es');
  });

  it('uses Spanish when the browser language starts with "es"', () => {
    expect(detectLang(null, 'es')).toBe('es');
    expect(detectLang(null, 'es-419')).toBe('es');
    expect(detectLang(null, 'ES-co')).toBe('es');
  });

  it('defaults to English otherwise', () => {
    expect(detectLang(null, 'en-GB')).toBe('en');
    expect(detectLang(null, 'pt-BR')).toBe('en');
    expect(detectLang(null, undefined)).toBe('en');
  });

  it('ignores a tampered saved value', () => {
    expect(detectLang('klingon', 'es-ES')).toBe('es');
    expect(detectLang('klingon', 'en')).toBe('en');
  });
});

describe('formatMessage', () => {
  it('fills {placeholders} from the values', () => {
    expect(formatMessage('Open to freelance · {year}', { year: 2026 })).toBe('Open to freelance · 2026');
  });

  it('fills every occurrence', () => {
    expect(formatMessage('{a}-{a}', { a: 'x' })).toBe('x-x');
  });

  it('leaves unknown placeholders untouched', () => {
    expect(formatMessage('Hi {name}', {})).toBe('Hi {name}');
  });
});
