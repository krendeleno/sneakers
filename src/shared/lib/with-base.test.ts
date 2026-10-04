import { afterEach, describe, expect, it, vi } from 'vitest';
import { withBase } from './with-base';

describe('withBase', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('склеивает base без слеша на конце', () => {
    vi.stubEnv('BASE_URL', '/sneakers');

    expect(withBase('posters/a.jpg')).toBe('/sneakers/posters/a.jpg');
  });

  it('не дублирует слеши', () => {
    vi.stubEnv('BASE_URL', '/sneakers/');

    expect(withBase('/shoes/a/')).toBe('/sneakers/shoes/a/');
  });

  it('работает с корневым base', () => {
    vi.stubEnv('BASE_URL', '/');

    expect(withBase('shoes/a/')).toBe('/shoes/a/');
  });

  it('корень сайта', () => {
    vi.stubEnv('BASE_URL', '/sneakers');

    expect(withBase('/')).toBe('/sneakers/');
  });
});
