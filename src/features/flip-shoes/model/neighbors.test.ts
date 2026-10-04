import { describe, expect, it } from 'vitest';
import { neighbors } from './neighbors';

const list = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

describe('neighbors', () => {
  it('has no prev on the first pair', () => {
    expect(neighbors(list, 'a')).toEqual({ prev: undefined, next: { id: 'b' }, index: 0, total: 3 });
  });

  it('has both neighbours in the middle', () => {
    expect(neighbors(list, 'b')).toEqual({ prev: { id: 'a' }, next: { id: 'c' }, index: 1, total: 3 });
  });

  it('has no next on the last pair', () => {
    expect(neighbors(list, 'c')).toEqual({ prev: { id: 'b' }, next: undefined, index: 2, total: 3 });
  });

  it('has no neighbours when the pair is alone', () => {
    expect(neighbors([{ id: 'a' }], 'a')).toEqual({ prev: undefined, next: undefined, index: 0, total: 1 });
  });

  it('returns undefined for an unknown id', () => {
    expect(neighbors(list, 'x')).toBeUndefined();
  });
});
