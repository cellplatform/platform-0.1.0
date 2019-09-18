import '../../test/dom';

import { expect } from 'chai';
import { DefaultSettings } from 'handsontable';

import { Grid, IGridArgs } from '.';
import { Handsontable, constants, t } from '../../common';

export const createGrid = (args: Partial<IGridArgs> = {}) => {
  const el = document.createElement('div');
  const settings: DefaultSettings = {};
  const table = new Handsontable(el, settings);
  return Grid.create({ table, totalColumns: 3, totalRows: 5, ...args });
};

describe('Grid', () => {
  describe('static', () => {
    it('isDefaultValue', () => {
      const defaults = Grid.defaults();
      const test = (kind: t.GridCellType, value: any, expected: boolean) => {
        const res = Grid.isDefaultValue({ defaults, kind, value });
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

  it('constructs', () => {
    const values = { A1: { value: 123 } };
    const columns = { A: { width: 200 } };
    const rows = { 10: { height: 200 } };
    const grid = createGrid({ totalColumns: 10, totalRows: 5, values, columns, rows });
    expect(grid.isEditing).to.eql(false);
    expect(grid.totalColumns).to.eql(10);
    expect(grid.totalRows).to.eql(5);
    expect(grid.values).to.eql(values);
    expect(grid.columns).to.eql(columns);
    expect(grid.rows).to.eql(rows);
  });

  it('dispose', () => {
    const grid = createGrid();
    expect(grid.isDisposed).to.eql(false);

    let count = 0;
    grid.dispose$.subscribe(() => count++);

    grid.dispose();
    grid.dispose();
    grid.dispose();

    expect(grid.isDisposed).to.eql(true);
    expect(count).to.eql(1);
  });

  describe('keyBindings', () => {
    it('default key bindings', () => {
      const grid = createGrid();
      expect(grid.keyBindings).to.eql(constants.DEFAULT.KEY_BINDINGS);
    });

    it('overrides key bindings (merged with defaults)', () => {
      const grid = createGrid({ keyBindings: [{ command: 'PASTE', key: 'Shift+W' }] });
      expect(grid.keyBindings).to.not.eql(constants.DEFAULT.KEY_BINDINGS);

      const paste = grid.keyBindings.find(b => b.command === 'PASTE');
      expect(paste && paste.key).to.eql('Shift+W');
    });
  });

  describe('cell', () => {
    it('from row/column', () => {
      const grid = createGrid();
      const cell = grid.cell({ row: 0, column: 0 });
      expect(cell.row).to.eql(0);
      expect(cell.column).to.eql(0);
      expect(cell.key).to.eql('A1');
    });

    it('from key', () => {
      const grid = createGrid();
      const cell = grid.cell('B5');
      expect(cell.column).to.eql(1);
      expect(cell.row).to.eql(4);
    });
  });

  describe('changeCells', () => {
    it('changes an existing value', () => {
      const grid = createGrid({ values: { A1: { value: 123 } } });
      const values1 = grid.values;
      expect(values1).to.eql({ A1: { value: 123 } });

      grid.changeCells({ A1: { value: 456 } });
      const values2 = grid.values;
      expect(values1).to.not.equal(values2);
      expect(values2.A1).to.eql({ value: 456 });
    });

    it('adds a new value', () => {
      const grid = createGrid({ values: { A1: { value: 123 } } });
      grid.changeCells({ B1: { value: 'hello' } });
      expect(grid.values.A1).to.eql({ value: 123 });
      expect(grid.values.B1).to.eql({ value: 'hello' });
    });

    it('does not store empty values', () => {
      const grid = createGrid();
      expect(grid.values).to.eql({});
      grid.changeCells({
        A1: { value: '' },
        A2: { value: undefined },
        A3: { value: undefined, props: {} },
        A4: { value: '', props: {} },
      });
      expect(grid.values).to.eql({});
    });

    it('deletes empty values', () => {
      const grid = createGrid({
        values: {
          A1: { value: 123 },
          A2: { value: 456 },
          A3: { value: 789 },
        },
      });
      expect(grid.values).to.eql({ A1: { value: 123 }, A2: { value: 456 }, A3: { value: 789 } });
      grid.changeCells({
        A1: { value: '', props: {} },
        A2: { value: undefined, props: { bold: true } }, // NB: Not empty because of props.
        A3: undefined,
      });
      expect(grid.values).to.eql({ A2: { value: undefined, props: { bold: true } } });
    });

    it('does nothing with column/row values', () => {
      const grid = createGrid();
      grid.changeCells({
        A1: { value: 123 },
        '1': { height: 250 }, // Not allowed (stripped off).
        A: { width: 400 }, //    Not allowed (stripped off).
      } as any);
      expect(grid.values).to.eql({ A1: { value: 123 } });
    });
  });

  describe('selection', () => {
    const values = {
      A1: { value: 123 },
      A2: { value: 456 },
      A3: { value: 789 },
      A5: { value: 'hello' },
    };

    it('no selection', () => {
      const grid = createGrid({ values });
      const res = grid.selection;
      expect(res.cell).to.eql(undefined);
      expect(res.ranges).to.eql([]);
    });

    it('select: single cell', () => {
      const grid = createGrid({ values }).select({ cell: 'A1' });
      const res = grid.selection;
      expect(res.cell).to.eql('A1');
    });
  });
});
