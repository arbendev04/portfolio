import type { Lang, Localized } from '../i18n/lang';

export interface Certification {
  id: string;
  /** Official credential name, as the issuer publishes it (not translated). */
  name: string;
  issuer: string;
  /** Issue date, ISO yyyy-mm-dd. */
  issued: string;
  /** Public verification page — the card links straight here. */
  url: string;
  /** Badge artwork, saved under public/certifications/. */
  image: string;
  /** One line on what the credential covers. */
  summary: Localized<string>;
}

/** Newest first (certifications.test.ts checks). */
export const certifications: Certification[] = [
  {
    id: 'cisco-intro-cybersecurity',
    name: 'Introduction to Cybersecurity',
    issuer: 'Cisco',
    issued: '2024-11-21',
    url: 'https://www.credly.com/badges/16f83ce4-ff31-441e-b7cd-da841b83d290',
    image: '/certifications/cisco-intro-cybersecurity.png',
    summary: {
      en: 'Cyber threats and their impact, vulnerabilities, threat detection and defense.',
      es: 'Amenazas digitales y su impacto, vulnerabilidades, detección de amenazas y defensa.',
    },
  },
];

const MONTHS: Readonly<Record<Lang, readonly string[]>> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  es: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
};

/** "Nov 2024" / "nov 2024". Read straight from the ISO string rather than via
 * Date, so no time zone can move the 1st of a month into the previous one. */
export function formatIssued(isoDate: string, lang: Lang): string {
  const [year, month] = isoDate.split('-');
  return `${MONTHS[lang][Number(month) - 1]} ${year}`;
}
