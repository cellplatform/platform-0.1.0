import { expect } from 'chai';
import { t } from '../common';
import { isDefaultGridValue } from '.';

const defaults: t.IGridDefaults = {
  columWidth: 120,
  columnWidthMin: 26,
  rowHeight: 26,
  rowHeightMin: 26,
};

describe('util.grid', () => {
  it('isDefaultValue', () => {
    const test = (kind: t.GridCellType, value: any, expected: boolean) => {
      const res = isDefaultGridValue({ defaults, kind, value });
      expect(res).to.eql(expected);
    };

    test('CELL', undefined, true);
    test('CELL', { value: 0 }, false);
    test('CELL', { props: {} }, true);
    test('CELL', { props: { style: { bold: true } } }, false);

    test('COLUMN', undefined, true);
    test('COLUMN', { width: defaults.columWidth }, true);
    test('COLUMN', { width: 456 }, false);
    test('COLUMN', { foo: true }, false);

    test('ROW', undefined, true);
    test('ROW', { height: defaults.rowHeight }, true);
    test('ROW', { height: 456 }, false);
    test('ROW', { foo: true }, false);
  });
});
