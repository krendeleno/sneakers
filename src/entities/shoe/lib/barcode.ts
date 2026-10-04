/** FNV-1a: a stable 32-bit hash, so the same shoe id always prints the same label. */
export function hash(text: string) {
  const h = [...text].reduce((acc, char) => Math.imul(acc ^ char.charCodeAt(0), 0x01000193), 0x811c9dc5);

  return h >>> 0;
}

const GUARD = [2, 1, 1, 2, 1, 2];

/**
 * Decorative Code128-looking barcode for a shoebox label: bar/space widths in modules, starting with a bar.
 * Not a scannable code — just deterministic noise framed by guard patterns.
 */
export function barcodeFor(id: string) {
  let seed = hash(id);
  const widths = [...GUARD];

  for (let i = 0; i < 36; i++) {
    seed = Math.imul(seed ^ (seed >>> 15), 0x2c1b3c6d) >>> 0;
    widths.push(1 + (seed % 4));
  }

  // Odd count keeps the closing guard starting on a bar.
  if (widths.length % 2) widths.push(1);
  widths.push(...GUARD, 3);

  const h = hash(`${id}#article`);
  const article = `${String(h % 1e6).padStart(6, '0')}-${String((h >>> 20) % 1e3).padStart(3, '0')}`;

  return { widths, article };
}
