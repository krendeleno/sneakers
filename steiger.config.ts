import fsd from '@feature-sliced/steiger-plugin';
import { defineConfig } from 'steiger';

export default defineConfig([
  ...fsd.configs.recommended,
  // src/pages is Astro routing (flat files), content.config.ts is Astro's convention — both outside FSD rules.
  { ignores: ['./src/pages/**', './src/content.config.ts', './src/**/*.test.ts'] },
  // ponytail: each slice is used by a single page today; re-enable when the site grows.
  { rules: { 'fsd/insignificant-slice': 'off' } },
  // Every widget is about a shoe (catalog, showcase, gallery) — the shared prefix is the domain, not a missing group.
  { rules: { 'fsd/repetitive-naming': 'off' } },
]);
