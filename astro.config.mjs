import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://krendeleno.github.io',
  base: '/sneakers',
  i18n: { defaultLocale: 'en', locales: ['en', 'ru'], routing: { prefixDefaultLocale: false } },
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
});
