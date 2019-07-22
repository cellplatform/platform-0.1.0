import { expect } from 'chai';
import * as coord from '..';

describe('range', () => {
  it('range', () => {
    const test = (input: string, key: string) => {
      const res = coord.range.fromKey(key);
      expect(res.key).to.eql(key);
    };
    test(' A1:B9 ', 'A1:B9');
    test(' B9:A1 ', 'A1:B9'); // Auto inverted.
  });

  it('union', () => {
    const test = (input: string | string[], key: string) => {
      const res = coord.range.union(input);
      expect(res.key).to.eql(key);
    };
    test(' A1:Z9', 'A1:Z9');
    test('  A1:B9  , B2:Z9', 'A1:B9, B2:Z9');
    // test('  A1:B9  , Z9:B2', 'A1:B9, B2:Z9');
  });
});
