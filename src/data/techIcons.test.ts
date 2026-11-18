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
    expect(itemsOf('seo')).toEqual(['SEO', 'GEO', 'AEO', 'Google Search Console', 'Google Analytics', 'Google Business Profile']);
  });

  it('lists Zoho with AI and automation', () => {
    expect(itemsOf('ai')).toContain('Zoho');
  });

  it('orders frameworks first (Astro leading), then languages, then the database', () => {
    expect(itemsOf('frameworks')).toEqual(['Astro', 'React', 'Angular', 'JavaScript', 'TypeScript', 'PHP', 'PostgreSQL']);
  });

  it('lists Crocoblock with web development', () => {
    expect(itemsOf('web')).toContain('Crocoblock');
  });

  it('no longer lists Zapier or Python', () => {
    const all = categories.flatMap((cat) => cat.items);
    expect(all).not.toContain('Zapier');
    expect(all).not.toContain('Python');
  });

  it.each(LANGS)('explains every acronym in %s', (lang) => {
    Object.values(acronyms).forEach((meaning) => expect(meaning[lang].trim()).not.toBe(''));
  });
});
