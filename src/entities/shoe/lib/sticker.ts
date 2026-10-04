import { hash } from './barcode';

/**
 * How a box's label sticker sits and has aged: a tiny tilt from the id hash (−1.2°…+1.2°, stable per pair)
 * and paper wear by release year (0 crisp … 1 yellowed): older than 1980 aged, 1980–2005 lightly, newer crisp.
 */
export function stickerFor(id: string, year: number) {
  const tilt = Math.round(((hash(`${id}#tilt`) % 2401) / 1000 - 1.2) * 100) / 100;

  return { tilt, age: ageFor(year) };
}

function ageFor(year: number) {
  if (year < 1980) return 1;
  if (year <= 2005) return 0.4;

  return 0;
}
