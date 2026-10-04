import { afterEach, describe, expect, it, vi } from 'vitest';
import { withBase } from './with-base';

describe('withBase', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('joins a base without a trailing slash', () => {
    vi.stubEnv('BASE_URL', '/sneakers');

    expect(withBase('posters/a.jpg')).toBe('/sneakers/posters/a.jpg');
  });

  it('does not duplicate slashes', () => {
    vi.stubEnv('BASE_URL', '/sneakers/');

    expect(withBase('/shoes/a/')).toBe('/sneakers/shoes/a/');
  });

  it('works with the root base', () => {
    vi.stubEnv('BASE_URL', '/');

    expect(withBase('shoes/a/')).toBe('/shoes/a/');
  });

  it('handles the site root', () => {
    vi.stubEnv('BASE_URL', '/sneakers');

    expect(withBase('/')).toBe('/sneakers/');
  });
});
