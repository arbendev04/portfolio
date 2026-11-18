import { describe, expect, it } from 'vitest';
import { injectPrerender, ROOT_PLACEHOLDER, visibleTextLength } from './prerender';

const TEMPLATE = `<!doctype html><html><head><title>x</title></head><body>${ROOT_PLACEHOLDER}<script></script></body></html>`;

describe('injectPrerender', () => {
  it('puts the app markup inside the root, marked as prerendered', () => {
    const html = injectPrerender(TEMPLATE, { appHtml: '<main>Hola</main>', headHtml: '' });
    expect(html).toContain('<div id="root" data-prerendered><main>Hola</main></div>');
    expect(html).not.toContain(ROOT_PLACEHOLDER);
  });

  it('appends extra head markup right before </head>', () => {
    const html = injectPrerender(TEMPLATE, { appHtml: '', headHtml: '<meta name="a" />' });
    expect(html).toContain('<title>x</title><meta name="a" /></head>');
  });

  it('does not treat $ sequences in the markup as replacement patterns', () => {
    const html = injectPrerender(TEMPLATE, { appHtml: '<p>$& $1 $$</p>', headHtml: '' });
    expect(html).toContain('<p>$& $1 $$</p>');
  });

  it('fails loudly when the template has no empty root', () => {
    expect(() => injectPrerender('<html><head></head><body></body></html>', { appHtml: 'x', headHtml: '' })).toThrow(
      /root/,
    );
  });

  it('fails loudly when the template has no </head>', () => {
    expect(() => injectPrerender(`<body>${ROOT_PLACEHOLDER}</body>`, { appHtml: 'x', headHtml: '' })).toThrow(/head/);
  });
});

describe('visibleTextLength', () => {
  it('counts text only, ignoring tags, scripts, styles and extra whitespace', () => {
    const html = '<div><style>.a{}</style><h1>Hola  <b>mundo</b></h1>\n<script>var x = 1;</script><p>&amp;</p></div>';
    // "Hola mundo &"
    expect(visibleTextLength(html)).toBe('Hola mundo &'.length);
  });
});
