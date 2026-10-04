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
  it('owned с моделью валиден', () => {
    expect(shoeSchema.safeParse({ ...base, status: 'owned', model: 'af1.glb' }).success).toBe(true);
  });

  it('owned без модели невалиден', () => {
    expect(shoeSchema.safeParse({ ...base, status: 'owned' }).success).toBe(false);
  });

  it('wish с моделью невалиден', () => {
    expect(shoeSchema.safeParse({ ...base, status: 'wish', model: 'af1.glb' }).success).toBe(false);
  });

  it('hotspots по умолчанию — пустой массив', () => {
    expect(shoeSchema.parse({ ...base, status: 'wish' }).hotspots).toEqual([]);
  });

  it('description нужен на обоих языках', () => {
    expect(shoeSchema.safeParse({ ...base, status: 'wish', description: { en: 'Classic' } }).success).toBe(false);
  });

  it('label хотспота локализован', () => {
    const hotspot = { position: '0 0 0', label: { en: 'Toe', ru: 'Носок' } };

    expect(shoeSchema.safeParse({ ...base, status: 'wish', hotspots: [hotspot] }).success).toBe(true);
    expect(shoeSchema.safeParse({ ...base, status: 'wish', hotspots: [{ ...hotspot, label: 'Toe' }] }).success).toBe(
      false,
    );
  });

  it('photos по умолчанию — пустой массив', () => {
    expect(shoeSchema.parse({ ...base, status: 'wish' }).photos).toEqual([]);
  });

  it('wish с фото валиден', () => {
    expect(shoeSchema.safeParse({ ...base, status: 'wish', photos: ['af1-side.svg'] }).success).toBe(true);
  });

  it('owned с фото невалиден', () => {
    expect(shoeSchema.safeParse({ ...base, status: 'owned', model: 'af1.glb', photos: ['af1-side.svg'] }).success).toBe(
      false,
    );
  });

  it('wish без постера валиден, owned — нет', () => {
    const noPoster = { ...base, poster: undefined };

    expect(shoeSchema.safeParse({ ...noPoster, status: 'wish' }).success).toBe(true);
    expect(shoeSchema.safeParse({ ...noPoster, status: 'owned', model: 'af1.glb' }).success).toBe(false);
  });

  it('buyUrl должен быть URL', () => {
    expect(shoeSchema.safeParse({ ...base, status: 'wish', buyUrl: 'nike' }).success).toBe(false);
  });
});

describe('toShoe', () => {
  it('берёт локализованные поля на нужном языке', () => {
    const hotspot = { position: '0 0 0', label: { en: 'Toe', ru: 'Носок' } };
    const data = shoeSchema.parse({ ...base, status: 'wish', hotspots: [hotspot] });

    const shoe = toShoe({ id: 'af1', data }, 'ru');

    expect(shoe.description).toBe('Классика');
    expect(shoe.hotspots).toEqual([{ position: '0 0 0', label: 'Носок' }]);
    // Images don't ride along into island props: pages pass resized URLs instead.
    expect(shoe).not.toHaveProperty('poster');
  });
});
