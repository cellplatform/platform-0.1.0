import '../../test/dom';
import { expect } from 'chai';
import { Handsontable } from '../../common';
import { DefaultSettings } from 'handsontable';
import { Grid, IGridArgs } from '.';

const createGrid = (args: Partial<IGridArgs> = {}) => {
  const el = document.createElement('div');
  const settings: DefaultSettings = {};
  const table = new Handsontable(el, settings);
  return Grid.create({ table, totalColumns: 3, totalRows: 5, ...args });
};

describe('Grid', () => {
  it('constructs', () => {
    const values = { A1: 123 };
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

  describe('changeValues', () => {
    it('changes an existing value', () => {
      const grid = createGrid({ values: { A1: 123 } });
      const values1 = grid.values;
      expect(values1).to.eql({ A1: 123 });

      grid.changeValues({ A1: 456 });
      const values2 = grid.values;
      expect(values1).to.not.equal(values2);
      expect(values2.A1).to.eql(456);
    });

    it('adds a new value', () => {
      const grid = createGrid({ values: { A1: 123 } });
      grid.changeValues({ B1: 'hello' });
      expect(grid.values.A1).to.eql(123);
      expect(grid.values.B1).to.eql('hello');
    });
  });

  describe('selection', () => {
    const values = {
      A1: 123,
      A2: 456,
      A3: 789,
      A5: 'hello',
    };

    it('has no selection', () => {
      const grid = createGrid({ values });
      const res = grid.selection;
      expect(res.cell).to.eql(undefined);
      expect(res.ranges).to.eql([]);
    });

    it('selection: single cell', () => {
      const grid = createGrid({ values });
      grid.select({ cell: 'A1' });
      const res = grid.selection;
      expect(res.cell).to.eql('A1');
    });
  });
});
