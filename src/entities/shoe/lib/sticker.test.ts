import { describe, expect, it } from 'vitest';
import { stickerFor } from './sticker';

describe('stickerFor', () => {
  it('tilts each label by a stable angle within ±1.2°', () => {
    const ids = ['nike-air-force-1', 'adidas-samba', 'converse-chuck-70', 'vans-old-skool'];

    const tilts = ids.map((id) => stickerFor(id, 2020).tilt);

    expect(tilts.every((t) => Math.abs(t) <= 1.2)).toBe(true);
    expect(new Set(tilts).size).toBeGreaterThan(1);
    expect(stickerFor('adidas-samba', 2020)).toEqual(stickerFor('adidas-samba', 2020));
  });

  it('ages the paper by release year', () => {
    expect(stickerFor('a', 1950).age).toBe(1);
    expect(stickerFor('a', 1982).age).toBe(0.4);
    expect(stickerFor('a', 2005).age).toBe(0.4);
    expect(stickerFor('a', 2006).age).toBe(0);
  });
});
