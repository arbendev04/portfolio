import { describe, expect, it } from 'vitest';
import { LANGS } from '../i18n/lang';
import { acronyms, categories, icons } from './techIcons';

const itemsOf = (key: string) => categories.find((c) => c.key === key)?.items ?? [];

describe('tech stack categories', () => {
  it('gives every tile something to show: a logo or an acronym', () => {
    categories.forEach((cat) =>
      cat.items.forEach((item) => expect(Boolean(icons[item]) || Boolean(acronyms[item])).toBe(true)),
    );
  });

  it('lists each technology only once', () => {
    const all = categories.flatMap((c) => c.items);
    expect(new Set(all).size).toBe(all.length);
  });

  it('groups search and AI visibility in its own row', () => {
    expect(itemsOf('seo')).toEqual(['SEO', 'GEO', 'AEO', 'Google Search Console', 'Google Analytics']);
  });

  it('lists Zoho with AI and automation', () => {
    expect(itemsOf('ai')).toContain('Zoho');
  });

  it.each(LANGS)('explains every acronym in %s', (lang) => {
    Object.values(acronyms).forEach((meaning) => expect(meaning[lang].trim()).not.toBe(''));
  });
});
