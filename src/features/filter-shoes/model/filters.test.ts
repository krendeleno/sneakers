import { describe, expect, it } from 'vitest';
import type { Shoe } from '@/entities/shoe';
import {
  applyFilters,
  colorRank,
  DEFAULT_FILTERS,
  facetOptions,
  filtersFromSearch,
  filtersToSearch,
  sortShoes,
} from './filters';

const shoe = (over: Partial<Shoe>): Shoe => ({
  id: 'x',
  name: 'X',
  brand: 'Nike',
  year: 2020,
  colors: ['white'],
  status: 'owned',
  hotspots: [],
  description: 'X',
  ...over,
});

const shoes = [
  shoe({ id: 'af1', name: 'Air Force 1', brand: 'Nike', year: 2021, colors: ['white'] }),
  shoe({ id: 'samba', name: 'Samba', brand: 'Adidas', year: 2019, colors: ['black', 'white'] }),
  shoe({ id: 'nb', name: '550', brand: 'New Balance', year: 2019, colors: ['green'] }),
  shoe({ id: 'vans', name: 'Old Skool', brand: 'Vans', year: 2022, status: 'wish' }),
];

const ids = (xs: Shoe[]) => xs.map((s) => s.id);

describe('applyFilters', () => {
  it('по умолчанию — только owned', () => {
    expect(ids(applyFilters(shoes, DEFAULT_FILTERS))).toEqual(['af1', 'samba', 'nb']);
  });

  it('статус wish', () => {
    expect(ids(applyFilters(shoes, { ...DEFAULT_FILTERS, status: 'wish' }))).toEqual(['vans']);
  });

  it('несколько брендов — ИЛИ', () => {
    const f = { ...DEFAULT_FILTERS, brands: ['Nike', 'Adidas'] };

    expect(ids(applyFilters(shoes, f))).toEqual(['af1', 'samba']);
  });

  it('цвет — совпадение по любому цвету пары', () => {
    expect(ids(applyFilters(shoes, { ...DEFAULT_FILTERS, colors: ['white'] }))).toEqual(['af1', 'samba']);
  });

  it('год', () => {
    expect(ids(applyFilters(shoes, { ...DEFAULT_FILTERS, year: 2019 }))).toEqual(['samba', 'nb']);
  });

  it('поиск по названию и бренду без учёта регистра', () => {
    expect(ids(applyFilters(shoes, { ...DEFAULT_FILTERS, query: ' balance ' }))).toEqual(['nb']);
    expect(ids(applyFilters(shoes, { ...DEFAULT_FILTERS, query: 'FORCE' }))).toEqual(['af1']);
  });
});

describe('sortShoes', () => {
  it('newest — по году, новые сначала', () => {
    expect(ids(sortShoes(shoes, 'newest'))).toEqual(['vans', 'af1', 'samba', 'nb']);
  });

  it('brand — по алфавиту, внутри бренда новые сначала', () => {
    const more = [...shoes, shoe({ id: 'dunk', brand: 'Nike', year: 2023 })];

    expect(ids(sortShoes(more, 'brand'))).toEqual(['samba', 'nb', 'dunk', 'af1', 'vans']);
  });

  it('color — по оттенку первого цвета, нейтральные сначала', () => {
    const colored = [
      shoe({ id: 'blue', colors: ['midnightblue'] }),
      shoe({ id: 'green', colors: ['green', 'white'] }),
      shoe({ id: 'white', colors: ['white', 'red'] }),
      shoe({ id: 'red', colors: ['red'] }),
      shoe({ id: 'weird', colors: ['chartreuse-ish'] }),
    ];

    expect(ids(sortShoes(colored, 'color'))).toEqual(['white', 'red', 'green', 'blue', 'weird']);
  });

  it('не мутирует вход', () => {
    const copy = [...shoes];

    sortShoes(shoes, 'brand');

    expect(shoes).toEqual(copy);
  });
});

describe('colorRank', () => {
  it('нейтральные < цветные < неизвестные, регистр не важен', () => {
    expect(colorRank('Black')).toBe(-1);
    expect(colorRank('teal')).toBe(180);
    expect(colorRank('nope')).toBe(360);
  });
});

describe('URL', () => {
  it('фильтры по умолчанию дают пустую строку', () => {
    expect(filtersToSearch(DEFAULT_FILTERS)).toBe('');
  });

  it('туда и обратно', () => {
    const f = {
      status: 'wish' as const,
      sort: 'brand' as const,
      brands: ['Nike', 'New Balance'],
      colors: ['white'],
      year: 2019,
      query: 'air',
    };

    expect(filtersFromSearch(filtersToSearch(f))).toEqual(f);
  });

  it('мусор в URL превращается в значения по умолчанию', () => {
    expect(filtersFromSearch('?status=lol&year=abc&sort=price')).toEqual(DEFAULT_FILTERS);
  });

  it('сортировка по умолчанию не попадает в URL', () => {
    expect(filtersToSearch({ ...DEFAULT_FILTERS, sort: 'color' })).toBe('?sort=color');
    expect(filtersToSearch({ ...DEFAULT_FILTERS, sort: 'newest' })).toBe('');
  });
});

describe('facetOptions', () => {
  it('уникальные отсортированные значения для статуса', () => {
    expect(facetOptions(shoes, 'owned')).toEqual({
      brands: ['Adidas', 'New Balance', 'Nike'],
      colors: ['black', 'green', 'white'],
      years: [2021, 2019],
    });
  });
});
