/** Pure HTML helpers for the build-time prerender (scripts/prerender.mjs). */

/** The empty mount point index.html ships with. */
export const ROOT_PLACEHOLDER = '<div id="root"></div>';

/** Set on the prerendered root; CSS hides it until the client app mounts. */
export const PRERENDERED_ATTR = 'data-prerendered';

export interface PrerenderParts {
  /** Markup rendered by React, placed inside #root. */
  appHtml: string;
  /** Extra markup (e.g. generated JSON-LD) appended to <head>. */
  headHtml: string;
}

/** Returns `template` with the app markup inside #root and `headHtml` at the
 * end of <head>. Throws when either anchor is missing, so a changed template
 * fails the build instead of silently shipping an empty page. */
export function injectPrerender(template: string, { appHtml, headHtml }: PrerenderParts): string {
  if (!template.includes(ROOT_PLACEHOLDER)) {
    throw new Error(`prerender: template has no empty root (${ROOT_PLACEHOLDER})`);
  }
  if (!template.includes('</head>')) {
    throw new Error('prerender: template has no </head>');
  }

  // function replacers: "$&"-style sequences in the markup stay literal
  return template
    .replace('</head>', () => `${headHtml}</head>`)
    .replace(ROOT_PLACEHOLDER, () => `<div id="root" ${PRERENDERED_ATTR}>${appHtml}</div>`);
}

const ENTITIES: Readonly<Record<string, string>> = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", nbsp: ' ' };

/** Length of the human-readable text in `html` (tags, scripts and styles
 * dropped, entities decoded, whitespace collapsed). Used for build reporting. */
export function visibleTextLength(html: string): number {
  const text = html
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(#?\w+);/g, (entity, name: string) => ENTITIES[name] ?? entity)
    .replace(/\s+/g, ' ')
    .trim();
  return text.length;
}
