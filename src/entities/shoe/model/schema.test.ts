import { z } from 'astro/zod';
import { describe, expect, it } from 'vitest';
import { shoeSchema as makeSchema, toShoe } from './schema';

// Image paths stay plain strings here: `image()` only exists inside Astro's content pipeline.
const shoeSchema = makeSchema(() => z.string());

const base = {
  name: 'AF1',
  brand: 'Nike',
  year: 2020,
  colors: ['white'],
  poster: 'af1.jpg',
  description: { en: 'Classic', ru: 'Классика' },
};

describe('shoeSchema', () => {
  it('accepts owned with a model', () => {
    expect(shoeSchema.safeParse({ ...base, status: 'owned', model: 'af1.glb' }).success).toBe(true);
  });

  it('accepts owned without a model', () => {
    expect(shoeSchema.safeParse({ ...base, status: 'owned' }).success).toBe(true);
  });

  it('rejects wish with a model', () => {
    expect(shoeSchema.safeParse({ ...base, status: 'wish', model: 'af1.glb' }).success).toBe(false);
  });

  it('defaults hotspots to an empty array', () => {
    expect(shoeSchema.parse({ ...base, status: 'wish' }).hotspots).toEqual([]);
  });

  it('requires description in both languages', () => {
    expect(shoeSchema.safeParse({ ...base, status: 'wish', description: { en: 'Classic' } }).success).toBe(false);
  });

  it('localizes hotspot labels', () => {
    const hotspot = { position: '0 0 0', label: { en: 'Toe', ru: 'Носок' } };

    expect(shoeSchema.safeParse({ ...base, status: 'wish', hotspots: [hotspot] }).success).toBe(true);
    expect(shoeSchema.safeParse({ ...base, status: 'wish', hotspots: [{ ...hotspot, label: 'Toe' }] }).success).toBe(
      false,
    );
  });

  it('defaults photos to an empty array', () => {
    expect(shoeSchema.parse({ ...base, status: 'wish' }).photos).toEqual([]);
  });

  it('accepts wish with photos', () => {
    expect(shoeSchema.safeParse({ ...base, status: 'wish', photos: ['af1-side.svg'] }).success).toBe(true);
  });

  it('accepts owned with photos', () => {
    expect(shoeSchema.safeParse({ ...base, status: 'owned', photos: ['af1-side.svg'] }).success).toBe(true);
  });

  it('allows a missing poster only without a model', () => {
    const noPoster = { ...base, poster: undefined };

    expect(shoeSchema.safeParse({ ...noPoster, status: 'wish' }).success).toBe(true);
    expect(shoeSchema.safeParse({ ...noPoster, status: 'owned' }).success).toBe(true);
    expect(shoeSchema.safeParse({ ...noPoster, status: 'owned', model: 'af1.glb' }).success).toBe(false);
  });

  it('requires buyUrl to be a URL', () => {
    expect(shoeSchema.safeParse({ ...base, status: 'wish', buyUrl: 'nike' }).success).toBe(false);
  });
});

describe('toShoe', () => {
  it('picks localized fields in the requested locale', () => {
    const hotspot = { position: '0 0 0', label: { en: 'Toe', ru: 'Носок' } };
    const data = shoeSchema.parse({ ...base, status: 'wish', hotspots: [hotspot] });

    const shoe = toShoe({ id: 'af1', data }, 'ru');

    expect(shoe.description).toBe('Классика');
    expect(shoe.hotspots).toEqual([{ position: '0 0 0', label: 'Носок' }]);
    // Images don't ride along into island props: pages pass resized URLs instead.
    expect(shoe).not.toHaveProperty('poster');
  });
});
