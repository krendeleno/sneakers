import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
// Imports the model segment directly: the config lives outside FSD layers and must not pull in UI.
import { shoeSchema } from '@/entities/shoe/model';

const shoes = defineCollection({
  loader: glob({ base: './content/shoes', pattern: '*.md' }),
  schema: ({ image }) => shoeSchema(image),
});

export const collections = { shoes };
