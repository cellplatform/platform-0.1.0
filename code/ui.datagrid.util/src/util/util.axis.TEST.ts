import { expect } from 'chai';

import { t } from '../common';
import * as util from './util.axis';

describe('axis (column/row)', () => {
  it('isAxisChanged', () => {
    const test = <T = t.IGridColumnData | t.IGridRowData>(
      left: T | undefined,
      right: T | undefined,
      expected: boolean,
    ) => {
      const res = util.isAxisChanged(left, right);
      expect(res).to.eql(expected);
    };

    test(undefined, undefined, false);
    test({ props: { width: 123 } }, { props: { width: 123 } }, false);
    test({ props: { height: 10 } }, { props: { height: 10 } }, false);

    test({ props: { width: 0 } }, { props: { width: 1 } }, true);
    test({ props: { height: 0 } }, { props: { height: 1 } }, true);

    test(undefined, { props: { width: 1 } }, true);
    test({ props: { height: 1 } }, undefined, true);
  });

  it('isRowChanged', () => {
    expect(util.isRowChanged(undefined, undefined)).to.eql(false);
    expect(util.isRowChanged(undefined, { props: { height: 1 } })).to.eql(true);
    expect(util.isRowChanged({ props: { height: 123 } }, { props: { height: 456 } })).to.eql(true);
    expect(util.isRowChanged({ props: { height: 123 } }, { props: { height: 123 } })).to.eql(false);
  });

  it('isColumnChanged', () => {
    expect(util.isColumnChanged(undefined, undefined)).to.eql(false);
    expect(util.isColumnChanged(undefined, { props: { width: 1 } })).to.eql(true);
    expect(util.isColumnChanged({ props: { width: 123 } }, { props: { width: 456 } })).to.eql(true);
    expect(util.isColumnChanged({ props: { width: 123 } }, { props: { width: 123 } })).to.eql(
      false,
    );
  });
});
