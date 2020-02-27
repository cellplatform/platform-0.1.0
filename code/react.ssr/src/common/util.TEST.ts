import { expect } from '../test';

import * as util from './util';

describe('util', () => {
  it('firstSemver', () => {
    const test = (input: (string | undefined)[], expected?: string) => {
      const res = util.firstSemver(...input);
      expect(res).to.eql(expected);
    };

    test([], undefined);
    test([undefined], undefined);
    test(['foo', 'bar'], undefined);
    test(['1.2.3'], '1.2.3');
    test([undefined, '1.2.3'], '1.2.3');
    test([undefined, 'foo', '1.2.3'], '1.2.3');
    test(['/bundle/1.2.3-alpha.1'], '1.2.3-alpha.1');
  });
});
