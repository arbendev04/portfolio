import type { ProjectItem } from '../data/projects';

/** Must match the Person block's "@id" in index.html (jsonLd.test.ts checks). */
export const PERSON_ID = 'https://arben.dev/#person';

export interface ProjectListEntry {
  '@type': 'ListItem';
  position: number;
  item: {
    '@type': 'CreativeWork';
    name: string;
    url?: string;
    description: string;
    creator: { '@id': string };
  };
}

export interface ProjectsJsonLd {
  '@context': 'https://schema.org';
  '@type': 'ItemList';
  name: string;
  itemListElement: ProjectListEntry[];
}

/** The portfolio projects as a schema.org ItemList, in Spanish (the language
 * of the prerendered page). Generated from projects.ts, so it never drifts. */
export function projectsJsonLd(projects: readonly ProjectItem[]): ProjectsJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Proyectos de ArbenDev',
    itemListElement: projects.map((project, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'CreativeWork',
        name: project.title,
        url: project.url,
        description: project.description.es,
        creator: { '@id': PERSON_ID },
      },
    })),
  };
}

/** The ItemList as a ready-to-inject script tag. "<" is escaped as < so
 * no string inside can terminate the script element early. */
export function projectsJsonLdScript(projects: readonly ProjectItem[]): string {
  const json = JSON.stringify(projectsJsonLd(projects)).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">${json}</script>`;
}
