import { expect } from '../test';
import { t } from '../common';
import { value } from '.';

type R = t.IRowProps & { grid?: { height?: number } };
type C = t.IColumnProps & { grid?: { width?: number } };

describe('isEmpty (cell)', () => {
  it('isEmptyCell', () => {
    const hash = '346854e8420ee165a8146d0c385eb148f172c7cabb3a3b76d542252890cd0cf9';
    const test = (input: t.ICellData<any> | undefined, expected: boolean) => {
      expect(value.isEmptyCell(input)).to.eql(expected);
    };
    test(undefined, true);
    test({ value: '' }, true);
    test({ value: undefined }, true);
    test({ value: '', hash }, true);
    test({ value: undefined, hash: 'abc123z' }, true);
    test({ value: undefined, props: {} }, true); // NB: props object is empty.
    test({ value: '', props: {} }, true);
    test({ value: '', props: { status: {} } }, true);
    test({ value: '', props: { status: {}, style: {}, view: {}, merge: {} } }, true);
    test({ value: undefined, props: { status: {}, style: {}, view: {}, merge: {} } }, true);
    test({ props: { status: {}, style: {}, view: {}, merge: {} } }, true);
    test({ value: undefined, props: { value: undefined } }, true);
    test({ links: {} }, true);

    test({ value: ' ' }, false);
    test({ value: ' ', hash }, false);
    test({ value: 0 }, false);
    test({ value: null }, false);
    test({ value: {} }, false);
    test({ value: { foo: 123 } }, false);
    test({ value: true }, false);
    test({ value: false }, false);
    test({ value: undefined, props: { value: 456 } }, false); // NB: has props, therefore not empty.
    test({ links: { foo: 'ns:abc' } }, false);
  });

  it('isEmptyCellValue', () => {
    const test = (input: t.CellValue | undefined, expected: boolean) => {
      expect(value.isEmptyCellValue(input)).to.eql(expected);
    };
    test(undefined, true);
    test('', true);

    test(' ', false);
    test(null, false);
    test(0, false);
    test(123, false);
    test({}, false);
    test([], false);
    test(true, false);
    test(false, false);
  });

  it('isEmptyCellProps', () => {
    const test = (input: {} | undefined, expected: boolean) => {
      expect(value.isEmptyCellProps(input)).to.eql(expected);
    };
    test(undefined, true);
    test({}, true);
    test({ style: {} }, true);
    test({ style: {}, merge: {} }, true);
    test({ style: {}, merge: {}, view: {} }, true);
    test({ status: {} }, true);
    test({ value: undefined }, true);

    test({ style: { bold: true } }, false);
    test({ style: { bold: true }, merge: {} }, false);
    test({ view: { type: 'DEFAULT' } }, false);
    test({ status: { error: { message: 'Fail', type: 'UNKNOWN' } } }, false);
  });

  it('isEmptyCellLinks', () => {
    const test = (input: {} | undefined, expected: boolean) => {
      expect(value.isEmptyCellLinks(input)).to.eql(expected);
    };
    test(undefined, true);
    test({}, true);
    test({ foo: 'ns:abc' }, false);
  });
});

describe('isEmpty (row)', () => {
  it('isEmptyRowProps', () => {
    const test = (input: R | undefined, expected: boolean) => {
      expect(value.isEmptyRowProps(input)).to.eql(expected);
    };
    test(undefined, true);
    test({}, true);
    test({ grid: {} }, true);

    test({ grid: { height: 0 } }, false);
    test({ grid: { height: 123 } }, false);
  });
});

describe('isEmpty (column)', () => {
  it('isEmptyColumnProps', () => {
    const test = (input: C | undefined, expected: boolean) => {
      expect(value.isEmptyColumnProps(input)).to.eql(expected);
    };
    test(undefined, true);
    test({}, true);
    test({ grid: {} }, true);

    test({ grid: { width: 0 } }, false);
    test({ grid: { width: 123 } }, false);
  });
});
