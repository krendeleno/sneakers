import type { Shoe, ShoeStatus } from '@/entities/shoe';

export const SORTS = ['newest', 'brand', 'color'] as const;
export type ShoeSort = (typeof SORTS)[number];

export type ShoeFilters = {
  status: ShoeStatus;
  sort: ShoeSort;
  brands: string[];
  colors: string[];
  year: number | null;
  query: string;
};

export type FacetOptions = { brands: string[]; colors: string[]; years: number[] };

export const DEFAULT_FILTERS: ShoeFilters = {
  status: 'owned',
  sort: 'newest',
  brands: [],
  colors: [],
  year: null,
  query: '',
};

/** Switching the tab resets the other filters (facets differ per status) but keeps the sort. */
export function switchStatus(filters: ShoeFilters, status: ShoeStatus): ShoeFilters {
  return { ...DEFAULT_FILTERS, status, sort: filters.sort };
}

export function applyFilters<T extends Shoe>(shoes: T[], filters: ShoeFilters): T[] {
  const query = filters.query.trim().toLowerCase();

  return shoes.filter(
    (shoe) =>
      shoe.status === filters.status &&
      (filters.brands.length === 0 || filters.brands.includes(shoe.brand)) &&
      (filters.colors.length === 0 || shoe.colors.some((c) => filters.colors.includes(c))) &&
      (filters.year === null || shoe.year === filters.year) &&
      (query === '' || `${shoe.name} ${shoe.brand}`.toLowerCase().includes(query)),
  );
}

// Hues (HSL degrees) of the CSS color names shoes are tagged with; null = neutral.
const HUES: Record<string, number | null> = {
  white: null,
  black: null,
  gray: null,
  grey: null,
  silver: null,
  red: 0,
  maroon: 0,
  brown: 0,
  pink: 350,
  orange: 39,
  tan: 34,
  gold: 51,
  yellow: 60,
  beige: 60,
  olive: 60,
  green: 120,
  teal: 180,
  cyan: 180,
  blue: 240,
  navy: 240,
  midnightblue: 240,
  purple: 300,
};

/** Sort key for a color name: neutrals first (-1), then by hue, unknown names last. */
export function colorRank(color: string): number {
  const hue = HUES[color.toLowerCase()];
  if (hue === undefined) return 360;
  return hue ?? -1;
}

/** Order for the wall; ties fall back to newest first. */
export function sortShoes<T extends Shoe>(shoes: T[], sort: ShoeSort): T[] {
  const key = (shoe: Shoe) => {
    if (sort === 'brand') return shoe.brand.toLowerCase();
    if (sort === 'color') return colorRank(shoe.colors[0]);
    return 0;
  };

  return [...shoes].sort((a, b) => {
    const ka = key(a);
    const kb = key(b);

    if (ka < kb) return -1;
    if (ka > kb) return 1;

    return b.year - a.year;
  });
}

export function facetOptions(shoes: Shoe[], status: ShoeStatus): FacetOptions {
  const matching = shoes.filter((shoe) => shoe.status === status);
  const unique = <T>(values: T[]) => [...new Set(values)];

  return {
    brands: unique(matching.map((s) => s.brand)).sort(),
    colors: unique(matching.flatMap((s) => s.colors)).sort(),
    years: unique(matching.map((s) => s.year)).sort((a, b) => b - a),
  };
}

export function filtersToSearch(filters: ShoeFilters): string {
  const params = new URLSearchParams();

  if (filters.status !== DEFAULT_FILTERS.status) params.set('status', filters.status);
  if (filters.sort !== DEFAULT_FILTERS.sort) params.set('sort', filters.sort);
  for (const brand of filters.brands) params.append('brand', brand);
  for (const color of filters.colors) params.append('color', color);
  if (filters.year !== null) params.set('year', String(filters.year));
  if (filters.query) params.set('q', filters.query);

  const search = params.toString();
  return search ? `?${search}` : '';
}

export function filtersFromSearch(search: string): ShoeFilters {
  const params = new URLSearchParams(search);
  const year = Number(params.get('year'));
  const sort = SORTS.find((s) => s === params.get('sort'));

  return {
    status: params.get('status') === 'wish' ? 'wish' : 'owned',
    sort: sort ?? DEFAULT_FILTERS.sort,
    brands: params.getAll('brand'),
    colors: params.getAll('color'),
    year: Number.isInteger(year) && year > 0 ? year : null,
    query: params.get('q') ?? '',
  };
}
