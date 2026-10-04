// Signature box colors, muted for the dark theme. Keys are lowercased brand names.
const BOX_COLORS: Record<string, string> = {
  nike: '#7f3a14', // burnt orange
  adidas: '#1e3a66', // blue
  'new balance': '#45484d', // gray
  shopify: '#1c5240', // green
  converse: '#74221f', // brick red
  vans: '#3b1e24', // near-black burgundy
  puma: '#1a4650', // teal
  asics: '#222650', // indigo navy
  reebok: '#651a35', // crimson
  jordan: '#45101f', // dark wine, cooler and deeper than Converse brick
  fila: '#17213d', // deep navy
  xvessel: '#383b2c', // olive charcoal
};

/** Box color for a brand, or undefined for brands without one (they get the graphite wall shades). */
export function boxColor(brand: string): string | undefined {
  return BOX_COLORS[brand.trim().toLowerCase()];
}
