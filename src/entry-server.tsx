/** Build-time prerender entry: bundled by `vite build --ssr` and called by
 * scripts/prerender.mjs. Never shipped to the browser. */
import { renderToString } from 'react-dom/server';
import App from './App';
import { projects } from './data/projects';
import { setLang } from './i18n/langStore';
import { setMode } from './lib/modeStore';
import { setAccent } from './lib/accentStore';
import { defaultAccentFor } from './lib/accent';
import { projectsJsonLdScript } from './seo/jsonLd';

export { injectPrerender, visibleTextLength } from './seo/prerender';

/** The snapshot crawlers read: Spanish, dark mode, default accent — whatever
 * the build machine's locale says (Node exposes navigator.language too). */
function applySnapshotDefaults(): void {
  setLang('es');
  setMode('dark');
  setAccent(defaultAccentFor('dark'));
}

/** The whole page as static HTML. */
export function render(): string {
  applySnapshotDefaults();
  return renderToString(<App />);
}

/** Generated <head> additions (the projects ItemList JSON-LD). */
export function renderHead(): string {
  return projectsJsonLdScript(projects);
}
