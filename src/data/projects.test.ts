import { describe, expect, it } from 'vitest';
import { LANGS } from '../i18n/lang';
import { projects } from './projects';

describe('projects data', () => {
  it('has unique ids', () => {
    const ids = projects.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('links only to secure sites', () => {
    projects.forEach((p) => {
      if (p.url) expect(p.url.startsWith('https://')).toBe(true);
    });
  });

  it.each(LANGS)('gives every project a card description in %s', (lang) => {
    projects.forEach((p) => expect(p.description[lang].trim()).not.toBe(''));
  });

  it.each(LANGS)('gives every project the detail the modal shows in %s', (lang) => {
    projects.forEach((p) => {
      const details = p.details[lang];
      expect(details.challenge.trim()).not.toBe('');
      expect(details.solution.trim()).not.toBe('');
      expect(details.features.length).toBeGreaterThan(0);
      details.features.forEach((feature) => expect(feature.trim()).not.toBe(''));
    });
  });

  it('lists the same number of highlights in every language', () => {
    projects.forEach((p) => {
      const counts = LANGS.map((lang) => p.details[lang].features.length);
      expect(new Set(counts).size).toBe(1);
    });
  });

  it('lists at least one technology per project', () => {
    projects.forEach((p) => expect(p.tech.length).toBeGreaterThan(0));
  });
});
