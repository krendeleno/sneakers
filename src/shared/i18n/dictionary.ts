export type Locale = 'en' | 'ru';

export const LOCALES: Locale[] = ['en', 'ru'];

/** The `[...lang]` route param: en lives at the site root, other locales under `/<locale>/`. */
export const langParam = (locale: Locale) => (locale === 'en' ? undefined : locale);

const en = {
  siteTitle: 'My sneaker collection',
  siteDescription: 'My sneaker collection as a wall of shoeboxes: 3D models of owned pairs, a wishlist and my size.',
  /** Header sign's second line: "Est. 2021" */
  est: 'Est.',
  collection: 'Collection',
  catalogHeading: 'My collection',
  size: 'Size',
  footLength: 'Foot length',
  cm: 'cm',
  wishlist: 'Wishlist',
  status: 'Status',
  search: 'Search',
  searchPlaceholder: 'Search by name or brand',
  brand: 'Brand',
  color: 'Color',
  sort: 'Sort',
  sortNewest: 'Newest',
  sortBrand: 'Brand',
  sortColor: 'Color',
  nextPair: 'Next pair?',
  seeWishlist: 'See wishlist →',
  nothingFound: 'Nothing found',
  resetFilters: 'Reset filters',
  breadcrumb: 'Breadcrumb',
  whereToBuy: 'Where to buy',
  modelCredit: 'Model:',
  photoCredit: 'Photos:',
  modelAlt: '3D model of',
  modelError: 'Model failed to load',
  viewInAR: 'View in your space',
  colorway: 'Colorway',
  openPhoto: 'Open photo',
  photos: 'Photos',
  photoSoon: 'Photo coming soon',
  prevPhoto: 'Previous photo',
  nextPhoto: 'Next photo',
  close: 'Close',
  /** Prev/next pair links on a shoe page */
  pairNav: 'Pairs',
  prevShoe: 'Previous pair',
  nextShoe: 'Next pair',
  /** Footer note on every page */
  imagesNote: 'Images are AI-generated or my own photos unless noted otherwise.',
};

export type Dictionary = Record<keyof typeof en, string>;

const ru: Dictionary = {
  siteTitle: 'Моя коллекция кед',
  siteDescription: 'Моя коллекция кед в виде стены обувных коробок: 3D-модели моих пар, вишлист и мой размер.',
  est: 'С',
  collection: 'Коллекция',
  catalogHeading: 'Моя коллекция',
  size: 'Размер',
  footLength: 'Длина стопы',
  cm: 'см',
  wishlist: 'Вишлист',
  status: 'Статус',
  search: 'Поиск',
  searchPlaceholder: 'Поиск по названию или бренду',
  brand: 'Бренд',
  color: 'Цвет',
  sort: 'Сортировка',
  sortNewest: 'Новые',
  sortBrand: 'Бренд',
  sortColor: 'Цвет',
  nextPair: 'Следующая пара?',
  seeWishlist: 'Смотреть вишлист →',
  nothingFound: 'Ничего не найдено',
  resetFilters: 'Сбросить фильтры',
  breadcrumb: 'Навигационная цепочка',
  whereToBuy: 'Где купить',
  modelCredit: 'Модель:',
  photoCredit: 'Фото:',
  modelAlt: '3D-модель',
  modelError: 'Модель не загрузилась',
  viewInAR: 'Посмотреть у себя в комнате',
  colorway: 'Расцветка',
  openPhoto: 'Открыть фото',
  photos: 'Фото',
  photoSoon: 'Фото скоро',
  prevPhoto: 'Предыдущее фото',
  nextPhoto: 'Следующее фото',
  close: 'Закрыть',
  pairNav: 'Пары',
  prevShoe: 'Предыдущая пара',
  nextShoe: 'Следующая пара',
  imagesNote: 'Изображения сгенерированы ИИ или сняты мной, если не указано иное.',
};

const dictionaries: Record<Locale, Dictionary> = { en, ru };

/** UI strings for a locale. */
export function getTranslations(locale: Locale): Dictionary {
  return dictionaries[locale];
}
