import { expect } from 'chai';

import { t } from '../common';
import * as util from './util.axis';

describe('axis (column/row)', () => {
  it('isAxisChanged', () => {
    const test = <T = t.IGridAxisData>(
      left: T | undefined,
      right: T | undefined,
      expected: boolean,
    ) => {
      const res = util.isAxisChanged(left, right);
      expect(res).to.eql(expected);
    };

    test(undefined, undefined, false);
    test({ width: 123 }, { width: 123 }, false);
    test({ height: 10 }, { height: 10 }, false);

    test({ width: 0 }, { width: 1 }, true);
    test({ height: 0 }, { height: 1 }, true);

    test(undefined, { width: 1 }, true);
    test({ height: 1 }, undefined, true);
  });

  it('isRowChanged', () => {
    expect(util.isRowChanged(undefined, undefined)).to.eql(false);
    expect(util.isRowChanged(undefined, { height: 1 })).to.eql(true);
    expect(util.isRowChanged({ height: 123 }, { height: 456 })).to.eql(true);
    expect(util.isRowChanged({ height: 123 }, { height: 123 })).to.eql(false);
  });

  it('isColumnChanged', () => {
    expect(util.isColumnChanged(undefined, undefined)).to.eql(false);
    expect(util.isColumnChanged(undefined, { width: 1 })).to.eql(true);
    expect(util.isColumnChanged({ width: 123 }, { width: 456 })).to.eql(true);
    expect(util.isColumnChanged({ width: 123 }, { width: 123 })).to.eql(false);
  });
});
