import { describe, expect, it } from 'vitest';
import { barcodeFor } from './barcode';

describe('barcodeFor', () => {
  it('is deterministic per id and differs between ids', () => {
    expect(barcodeFor('nike-air-force-1')).toEqual(barcodeFor('nike-air-force-1'));
    expect(barcodeFor('nike-air-force-1').widths).not.toEqual(barcodeFor('adidas-samba').widths);
  });

  it('prints bars of 1–4 modules, ending on a bar, with a readable article number', () => {
    const { widths, article } = barcodeFor('khronos-shoe');

    expect(widths.every((w) => w >= 1 && w <= 4)).toBe(true);
    expect(widths.length % 2).toBe(1);
    expect(article).toMatch(/^\d{6}-\d{3}$/);
  });
});
