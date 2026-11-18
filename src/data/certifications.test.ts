import { describe, expect, it } from 'vitest';
import { LANGS } from '../i18n/lang';
import { certifications, formatIssued } from './certifications';

describe('certifications data', () => {
  it('includes the Cisco Introduction to Cybersecurity badge', () => {
    const cisco = certifications.find((c) => c.id === 'cisco-intro-cybersecurity');
    expect(cisco?.issuer).toBe('Cisco');
    expect(cisco?.url).toBe('https://www.credly.com/badges/16f83ce4-ff31-441e-b7cd-da841b83d290');
  });

  it('has unique ids', () => {
    const ids = certifications.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('links every credential to a secure verification page', () => {
    certifications.forEach((c) => expect(c.url.startsWith('https://')).toBe(true));
  });

  it('serves every badge image locally from public/certifications', () => {
    certifications.forEach((c) => expect(c.image).toMatch(/^\/certifications\/[\w-]+\.(png|webp|svg)$/));
  });

  it('stores the issue date as a valid ISO date', () => {
    certifications.forEach((c) => {
      expect(c.issued).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(c.issued))).toBe(false);
    });
  });

  it('lists the newest credential first', () => {
    const dates = certifications.map((c) => c.issued);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it.each(LANGS)('describes every credential in %s', (lang) => {
    certifications.forEach((c) => expect(c.summary[lang].trim()).not.toBe(''));
  });
});

describe('formatIssued', () => {
  it('shows the month and year in English', () => {
    expect(formatIssued('2024-11-21', 'en')).toBe('Nov 2024');
  });

  it('shows the month and year in Spanish', () => {
    expect(formatIssued('2024-11-21', 'es')).toBe('nov 2024');
  });

  it('does not shift the month across time zones', () => {
    expect(formatIssued('2024-01-01', 'en')).toBe('Jan 2024');
  });
});
