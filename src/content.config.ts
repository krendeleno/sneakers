import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
// Imports the model segment directly: the config lives outside FSD layers and must not pull in UI.
import { shoeSchema } from '@/entities/shoe/model';

// e2e builds against fixed fixtures (SHOES_DIR, see playwright.config.ts) so tests don't depend on the real collection.
const shoes = defineCollection({
  loader: glob({ base: import.meta.env.SHOES_DIR ?? './content/shoes', pattern: '*.md' }),
  schema: ({ image }) => shoeSchema(image),
});

export const collections = { shoes };
