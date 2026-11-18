// Build step 3 of 3 (see package.json "build"): renders the app to static HTML
// with the SSR bundle from `vite build --ssr` and writes it into
// dist/index.html, so crawlers that don't run JavaScript still see the page.
// The pure logic lives in src/seo/prerender.ts (unit-tested); this file is glue.
import { readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const indexPath = fileURLToPath(new URL('dist/index.html', root));
const ssrDir = fileURLToPath(new URL('dist-ssr/', root));
const ssrEntry = new URL('dist-ssr/entry-server.js', root).href;

// React picks its dev or prod server build from NODE_ENV when first imported;
// the prod one is faster and skips dev-only warnings (useLayoutEffect on the
// server is expected here: the client renders from scratch, no hydration).
process.env.NODE_ENV ??= 'production';

async function prerender() {
  const ssr = await import(ssrEntry);
  const template = await readFile(indexPath, 'utf8');
  const appHtml = ssr.render();
  const html = ssr.injectPrerender(template, { appHtml, headHtml: ssr.renderHead() });

  await writeFile(indexPath, html);
  await rm(ssrDir, { recursive: true, force: true });

  console.log(`prerender: dist/index.html — ${ssr.visibleTextLength(appHtml)} visible text chars in #root`);
}

prerender().catch((error) => {
  console.error('prerender failed:', error);
  process.exit(1);
});
