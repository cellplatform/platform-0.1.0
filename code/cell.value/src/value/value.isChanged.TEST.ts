import { value } from '.';
import { t } from '../common';
import { expect } from '../test';

type R = t.IRowData;
type C = t.IColumnData;
type A = C | R;

describe('axis (column/row)', () => {
  it('isAxisChanged', () => {
    const test = <T = A>(left: T | undefined, right: T | undefined, expected: boolean) => {
      const res = value.isAxisChanged(left, right);
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
    const test = <T = R>(left: T | undefined, right: T | undefined, expected: boolean) => {
      const res = value.isRowChanged(left, right);
      expect(res).to.eql(expected);
    };

    test(undefined, undefined, false);
    test(undefined, { props: { height: 1 } }, true);
    test({ props: { height: 123 } }, { props: { height: 456 } }, true);
    test({ props: { height: 123 } }, { props: { height: 123 } }, false);
  });

  it('isColumnChanged', () => {
    const test = <T = C>(left: T | undefined, right: T | undefined, expected: boolean) => {
      const res = value.isColumnChanged(left, right);
      expect(res).to.eql(expected);
    };

    test(undefined, undefined, false);
    test(undefined, { props: { width: 1 } }, true);
    test({ props: { width: 123 } }, { props: { width: 456 } }, true);
    test({ props: { width: 123 } }, { props: { width: 123 } }, false);
  });
});
