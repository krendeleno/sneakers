import { describe, expect, it } from 'vitest';
import { boxColor } from './box-color';

describe('boxColor', () => {
  it('gives known brands their color, case-insensitively', () => {
    expect(boxColor('Nike')).toBe('#7f3a14');
    expect(boxColor('new balance')).toBe(boxColor('New Balance'));
  });

  it('every brand on the wall gets its own color', () => {
    const brands = [
      'Nike',
      'Adidas',
      'New Balance',
      'Shopify',
      'Converse',
      'Vans',
      'Puma',
      'Asics',
      'Reebok',
      'Jordan',
      'Fila',
      'XVESSEL',
    ];

    const colors = brands.map(boxColor);

    expect(colors.every(Boolean)).toBe(true);
    expect(new Set(colors).size).toBe(brands.length);
  });

  it('leaves unknown brands to the default shades', () => {
    expect(boxColor('Saucony')).toBeUndefined();
  });
});
