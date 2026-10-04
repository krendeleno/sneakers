import { z } from 'astro/zod';
import type { Locale } from '@/shared/i18n';

const localized = z.object({ en: z.string().min(1), ru: z.string().min(1) });

const hotspotSchema = z.object({
  /** model-viewer coordinates in meters: "x y z" */
  position: z.string(),
  normal: z.string().optional(),
  label: localized,
});

/**
 * `image` is the collection's `image()` helper (see content.config.ts): paths in frontmatter are relative to the
 * markdown file and resolve to Astro image metadata. Unit tests pass a plain `() => z.string()`.
 */
export const shoeSchema = <Image extends z.ZodType>(image: () => Image) =>
  z
    .object({
      name: z.string().min(1),
      brand: z.string().min(1),
      year: z.number().int().min(1900),
      /** CSS color names — used for filter swatches and color sort */
      colors: z.array(z.string()).min(1),
      status: z.enum(['owned', 'wish']),
      size: z.string().optional(),
      model: z.string().optional(),
      /** 4:3 render, content/shoes/posters/ — wish pairs may have none yet (they get a "photo coming soon" placeholder) */
      poster: image().optional(),
      /** Gallery photos in content/shoes/photos/ — wish pairs only (owned pairs show the 3D model instead) */
      photos: z.array(image()).default([]),
      buyUrl: z.url().optional(),
      hotspots: z.array(hotspotSchema).default([]),
      credit: z.string().optional(),
      description: localized,
    })
    .refine(
      (shoe) => (shoe.status === 'owned' ? Boolean(shoe.model) : !shoe.model),
      'owned shoes need a model, wish shoes must not have one',
    )
    .refine((shoe) => shoe.status === 'wish' || shoe.poster !== undefined, 'owned shoes need a poster')
    .refine((shoe) => shoe.status === 'wish' || shoe.photos.length === 0, 'only wish shoes can have photos');

export type ShoeData<Image = ImageMetadata> = z.infer<ReturnType<typeof shoeSchema<z.ZodType<Image>>>>;
export type ShoeStatus = ShoeData['status'];

type Hotspot = Omit<ShoeData['hotspots'][number], 'label'> & { label: string };

/**
 * A shoe projected into one locale: localized fields become plain strings (keeps island props single-language).
 * Images are left out: pages resolve them to URLs of the size each place needs.
 */
export type Shoe = Omit<ShoeData, 'description' | 'hotspots' | 'poster' | 'photos'> & {
  id: string;
  description: string;
  hotspots: Hotspot[];
};

/** A box on the catalog wall: its page link and label thumbnail (none yet for some wish pairs), resolved by the page. */
export type WallShoe = Shoe & { href: string; thumb?: string };

export function toShoe<Image>(entry: { id: string; data: ShoeData<Image> }, locale: Locale): Shoe {
  const { poster, photos, description, hotspots, ...data } = entry.data;

  return {
    id: entry.id,
    ...data,
    description: description[locale],
    hotspots: hotspots.map((hotspot) => ({ ...hotspot, label: hotspot.label[locale] })),
  };
}
