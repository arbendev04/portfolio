// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://arben.dev', /* actualiza con tu dominio real */
  integrations: [sitemap()],
  devToolbar: {
    enabled: false,
  },
});
