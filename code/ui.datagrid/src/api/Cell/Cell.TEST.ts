import '../../test/dom';

import { expect } from 'chai';

import { Cell } from '.';
import { t } from '../../common';
import { createGrid } from '../Grid/Grid.TEST';

describe('Cell', () => {
  describe('static', () => {
    it('converts row/column to key', () => {
      expect(Cell.toKey({ row: 0, column: 0 })).to.eql('A1');
      expect(Cell.toKey({ row: 4, column: 1 })).to.eql('B5');
    });

    it('isEmpty', () => {
      const test = (input: t.IGridCell | undefined, expected: boolean) => {
        expect(Cell.isEmpty(input)).to.eql(expected);
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
      test({ value: undefined, props: { value: 123 } }, false); // NB: has props, not empty.
    });

    it('isEmptyValue', () => {
      const test = (input: t.CellValue | undefined, expected: boolean) => {
        expect(Cell.isEmptyValue(input)).to.eql(expected);
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
  });

  describe('data', () => {
    it('has key', () => {
      const grid = createGrid();
      const cell = grid.cell('A1');
      expect(cell.key).to.eql('A1');
    });

    it('has default value (undefined)', () => {
      const grid = createGrid();
      const cell = grid.cell('A1');
      expect(cell.value).to.eql(undefined);
    });

    it('has default props (empty {})', () => {
      const grid = createGrid();
      const cell = grid.cell('A1');
      expect(cell.props).to.eql({});
    });

    it('props', () => {
      const grid = createGrid().changeCells({
        A2: { value: 'A2', props: { style: { bold: true }, merge: { colspan: 3 } } },
      });
      const A1 = grid.cell('A1');
      const A2 = grid.cell('A2');

      const res1 = Cell.props(A1.props);
      const res2 = Cell.props(A2.props);

      expect(A1.props).to.eql({});
      expect(res1.style).to.eql({});
      expect(res1.merge).to.eql({});

      expect(res2.style.bold).to.eql(true);
      expect(res2.merge.colspan).to.eql(3);
    });
  });

  describe('diff', () => {
    it('no difference', () => {
      const cell: t.IGridCell = { value: 1, props: { style: { bold: true } } };
      const res = Cell.diff(cell, cell);
      expect(res.left).to.eql(cell);
      expect(res.right).to.eql(cell);
      expect(res.isDifferent).to.eql(false);
      expect(res.list.length).to.eql(0);
    });

    it('is different', () => {
      const left: t.IGridCell = { value: 1, props: { style: { bold: true } } };
      const right: t.IGridCell = { value: 2, props: { style: { bold: false } } };
      const res = Cell.diff(left, right);

      expect(res.isDifferent).to.eql(true);
      expect(res.list.length).to.eql(2);

      expect((res.list[0].path || []).join('.')).to.eql('value');
      expect((res.list[1].path || []).join('.')).to.eql('props.style.bold');
    });
  });

  describe('rowspan/colspan', () => {
    it('default span values (1)', () => {
      const grid = createGrid();
      const cell = grid.cell('A1');
      expect(cell.rowspan).to.eql(1);
      expect(cell.colspan).to.eql(1);
    });

    it('updates col/row span values', () => {
      const values1 = {
        A1: { value: 'A1', props: { merge: { colspan: 2 } } },
        B2: { value: 'B2', props: { merge: { colspan: 3, rowspan: 5 } } },
      };
      const grid = createGrid().changeCells(values1);
      expect((grid.values as any).A1.props.merge.colspan).to.eql(2);
      expect((grid.values as any).B2.props.merge.colspan).to.eql(3);
      expect((grid.values as any).B2.props.merge.rowspan).to.eql(5);
    });
  });
});
