import { describe, expect, it } from 'vitest';
import { LANGS } from '../i18n/lang';
import { formatProjectNumber, groupProjects, projects, type ProjectItem } from './projects';

const stub = (id: string, personal?: boolean): ProjectItem => ({
  id,
  tech: ['HTML / CSS'],
  title: id,
  description: { en: id, es: id },
  personal,
  details: {
    en: { challenge: id, solution: id, features: [id] },
    es: { challenge: id, solution: id, features: [id] },
  },
});

describe('groupProjects', () => {
  it('splits client work from personal projects, keeping their order', () => {
    const groups = groupProjects([stub('a'), stub('p1', true), stub('b'), stub('p2', true)]);
    expect(groups.client.map((p) => p.id)).toEqual(['a', 'b']);
    expect(groups.personal.map((p) => p.id)).toEqual(['p1', 'p2']);
  });

  it('returns an empty group when there are no projects of that kind', () => {
    expect(groupProjects([stub('a')]).personal).toEqual([]);
  });
});

describe('formatProjectNumber', () => {
  it('numbers from 01 within a group', () => {
    expect(formatProjectNumber(0)).toBe('01');
    expect(formatProjectNumber(9)).toBe('10');
  });
});

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

  it('includes the Song of Ice and Fire fan site, flagged as personal', () => {
    const fanSite = projects.find((p) => p.id === 'cancion-hielo-y-fuego');
    expect(fanSite?.personal).toBe(true);
    expect(fanSite?.url).toBe('https://cancion-hielo-y-fuego.netlify.app/');
  });

  it('lists at least one technology per project', () => {
    projects.forEach((p) => expect(p.tech.length).toBeGreaterThan(0));
  });
});
