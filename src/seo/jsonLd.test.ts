import { describe, expect, it } from 'vitest';
import indexHtml from '../../index.html?raw';
import { projects } from '../data/projects';
import { certifications } from '../data/certifications';
import { PERSON_ID, projectsJsonLd, projectsJsonLdScript } from './jsonLd';

type JsonObject = Record<string, unknown>;

/** Every `<script type="application/ld+json">` block of `html`, parsed. */
function ldJsonBlocks(html: string): JsonObject[] {
  const pattern = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  return [...html.matchAll(pattern)].map((match) => JSON.parse(match[1]) as JsonObject);
}

function blockOfType(type: string): JsonObject {
  const block = ldJsonBlocks(indexHtml).find((b) => b['@type'] === type);
  if (!block) throw new Error(`no ${type} block in index.html`);
  return block;
}

const SAME_AS = [
  'https://github.com/arbendev04',
  'https://www.linkedin.com/in/santiago-arango-benjumea-383864219/',
  'https://www.instagram.com/arbendev/',
];

describe('index.html JSON-LD', () => {
  it('has only blocks that parse as JSON and declare the schema.org context', () => {
    const blocks = ldJsonBlocks(indexHtml);
    expect(blocks.length).toBeGreaterThanOrEqual(3);
    blocks.forEach((block) => expect(block['@context']).toBe('https://schema.org'));
  });

  it('describes the Person with a stable @id the other blocks point at', () => {
    const person = blockOfType('Person');
    expect(person['@id']).toBe(PERSON_ID);
    expect(person.name).toBe('Santiago Arango Benjumea');
    expect(person.jobTitle).toEqual(expect.any(String));
    expect(person.url).toBe('https://arben.dev');
    expect(person.sameAs).toEqual(SAME_AS);
    expect(person.knowsAbout).toEqual(expect.arrayContaining(['Astro', 'Shopify', 'WooCommerce', 'React']));
  });

  it('lists every certification on the Person as a verifiable credential', () => {
    const person = blockOfType('Person');
    expect(person.hasCredential).toEqual(
      certifications.map((cert) => ({
        '@type': 'EducationalOccupationalCredential',
        name: cert.name,
        credentialCategory: 'badge',
        url: cert.url,
        recognizedBy: { '@type': 'Organization', name: cert.issuer },
      })),
    );
  });

  it('describes the ProfessionalService without a street address', () => {
    const service = blockOfType('ProfessionalService');
    expect(service).toMatchObject({
      name: 'ArbenDev',
      url: 'https://arben.dev',
      email: 'hola@arben.dev',
      telephone: '+57 305 326 8551',
      image: 'https://arben.dev/og-image.webp',
      founder: { '@id': PERSON_ID },
      address: { '@type': 'PostalAddress', addressLocality: 'Medellín', addressCountry: 'CO' },
      sameAs: SAME_AS,
    });
    expect(service.description).toEqual(expect.any(String));
    expect(service.serviceType).toEqual([
      'Desarrollo de páginas web',
      'Tiendas online (e-commerce)',
      'Software a medida',
      'Automatización de procesos',
    ]);
    expect(JSON.stringify(service.areaServed)).toContain('CO');
    expect(JSON.stringify(service.areaServed)).toContain('ES');
    expect(JSON.stringify(service.areaServed)).toContain('US');
    expect(service.address).not.toHaveProperty('streetAddress');
  });

  it('keeps the WebSite block, authored by the Person', () => {
    const site = blockOfType('WebSite');
    expect(site).toMatchObject({ name: 'ArbenDev', url: 'https://arben.dev', author: { '@id': PERSON_ID } });
  });
});

describe('projectsJsonLd', () => {
  it('lists every project in order, in Spanish, credited to the Person', () => {
    const list = projectsJsonLd(projects);
    expect(list['@type']).toBe('ItemList');
    expect(list.itemListElement).toHaveLength(projects.length);

    list.itemListElement.forEach((entry, i) => {
      expect(entry.position).toBe(i + 1);
      expect(entry.item).toMatchObject({
        '@type': 'CreativeWork',
        name: projects[i].title,
        url: projects[i].url,
        description: projects[i].description.es,
        creator: { '@id': PERSON_ID },
      });
    });
  });

  it('renders as a script tag whose body parses back to the same data', () => {
    const script = projectsJsonLdScript(projects);
    const [parsed] = ldJsonBlocks(script);
    expect(parsed).toEqual(projectsJsonLd(projects));
  });

  it('escapes "<" so a description can never close the script early', () => {
    const tricky = [{ ...projects[0], title: '</script><b>x' }];
    const script = projectsJsonLdScript(tricky);
    expect(script.match(/<\/script>/g)).toHaveLength(1);
    expect(ldJsonBlocks(script)[0]).toEqual(projectsJsonLd(tricky));
  });
});
