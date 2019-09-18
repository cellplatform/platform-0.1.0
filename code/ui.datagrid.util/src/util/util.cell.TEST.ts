import { expect } from 'chai';
import { t } from '../common';
import * as util from './util.cell';

describe('util.cell', () => {
  it('isEmptyCell', () => {
    const test = (input: t.IGridCell | undefined, expected: boolean) => {
      expect(util.isEmptyCell(input)).to.eql(expected);
    };
    test(undefined, true);
    test({ value: '' }, true);
    test({ value: undefined }, true);
    test({ value: undefined, props: {} }, true); // NB: props object is empty.
    test({ value: '', props: {} }, true);

    test({ value: ' ' }, false);
    test({ value: 0 }, false);
    test({ value: null }, false);
    test({ value: {} }, false);
    test({ value: { foo: 123 } }, false);
    test({ value: true }, false);
    test({ value: false }, false);
    test({ value: undefined, props: { value: 456 } }, false); // NB: has props, therefore not empty.
  });

  it('isEmptyCellValue', () => {
    const test = (input: t.CellValue | undefined, expected: boolean) => {
      expect(util.isEmptyCellValue(input)).to.eql(expected);
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
    const test = (input: t.ICellProps | undefined, expected: boolean) => {
      expect(util.isEmptyCellProps(input)).to.eql(expected);
    };
    test(undefined, true);
    test({}, true);
    test({ style: {} }, true);
    test({ style: {}, merge: {} }, true);

    test({ style: { bold: true } }, false);
    test({ style: { bold: true }, merge: {} }, false);
  });

  describe('isChanged', () => {
    type F = util.CellChangeField | util.CellChangeField[] | undefined;

    const test = (
      left: t.IGridCell | undefined,
      right: t.IGridCell | undefined,
      field: F,
      expected: boolean,
    ) => {
      const res = util.isCellChanged(left, right, field);
      expect(res).to.eql(expected);
    };

    const testProps = (left: t.ICellProps, right: t.ICellProps, field: F, expected: boolean) => {
      test({ value: -1, props: left }, { value: -1, props: right }, field, expected);
    };

    it('undefined (no change)', () => {
      test(undefined, undefined, undefined, false);
      test(undefined, undefined, 'PROPS', false);
      test(undefined, undefined, 'VALUE', false);
      test(undefined, undefined, 'merge', false);
      test(undefined, undefined, 'style', false);

      test(undefined, undefined, [], false);
      test(undefined, undefined, ['style', 'VALUE'], false);
      test(undefined, undefined, ['PROPS', 'VALUE'], false);
    });

    it('isChanged: props', () => {
      testProps({ style: { bold: true } }, { style: { bold: true } }, undefined, false);
      testProps({ style: { bold: true } }, { style: { bold: true } }, 'PROPS', false);
      testProps({ style: { bold: true } }, { style: { bold: false } }, 'PROPS', true);
      testProps({ style: { bold: true } }, { style: { bold: false } }, undefined, true);
      testProps(
        { style: { bold: true }, merge: { rowspan: 2 } },
        { style: { bold: true }, merge: { rowspan: 3 } },
        'PROPS',
        true,
      );
      testProps({ style: { bold: true } }, { style: { bold: false } }, 'merge', false); // Looking at merge.
      testProps({ style: { bold: true } }, { style: { bold: false } }, ['VALUE', 'style'], true);
      testProps({ style: { bold: true } }, { style: { bold: false } }, ['merge', 'style'], true);
    });

    it('isChanged: value', () => {
      test({ value: 1 }, { value: 1 }, undefined, false);
      test({ value: 1 }, { value: 1 }, 'VALUE', false);
      test({ value: 1 }, { value: 2 }, 'PROPS', false);

      test({ value: 1 }, { value: 2 }, undefined, true);
      test({ value: 1 }, { value: 2 }, 'VALUE', true);

      test({ value: 1 }, { value: 2 }, [], false);
      test({ value: 1 }, { value: 2 }, ['VALUE', 'style'], true);
      test({ value: 1 }, { value: 2 }, ['PROPS'], false);
    });
  });

  describe('cellDiff', () => {
    it('no difference', () => {
      const cell: t.IGridCell = { value: 1, props: { style: { bold: true } } };
      const res = util.cellDiff(cell, cell);
      expect(res.left).to.eql(cell);
      expect(res.right).to.eql(cell);
      expect(res.isDifferent).to.eql(false);
      expect(res.list.length).to.eql(0);
    });

    it('is different', () => {
      const left: t.IGridCell = { value: 1, props: { style: { bold: true } } };
      const right: t.IGridCell = { value: 2, props: { style: { bold: false } } };
      const res = util.cellDiff(left, right);

      expect(res.isDifferent).to.eql(true);
      expect(res.list.length).to.eql(2);

      expect((res.list[0].path || []).join('.')).to.eql('value');
      expect((res.list[1].path || []).join('.')).to.eql('props.style.bold');
    });
  });

  describe('toCellProps', () => {
    it('has default props (empty {})', () => {
      const test = (input?: any) => {
        const res = util.toCellProps(input);
        expect(res.merge).to.eql({});
        expect(res.style).to.eql({});
      };
      test();
      test(null);
      test({});
    });

    it('props', () => {
      const A2: t.IGridCell = {
        value: 'Hello',
        props: { style: { bold: true }, merge: { colspan: 3 } },
      };
      const res = util.toCellProps(A2.props);
      expect(res.style.bold).to.eql(true);
      expect(res.merge.colspan).to.eql(3);
    });
  });
});
