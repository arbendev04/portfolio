import { describe, expect, it } from 'vitest';
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

  it('gives every project the detail the modal shows', () => {
    projects.forEach((p) => {
      expect(p.details.challenge.trim()).not.toBe('');
      expect(p.details.solution.trim()).not.toBe('');
      expect(p.details.features.length).toBeGreaterThan(0);
    });
  });

  it('lists at least one technology per project', () => {
    projects.forEach((p) => expect(p.tech.length).toBeGreaterThan(0));
  });
});
