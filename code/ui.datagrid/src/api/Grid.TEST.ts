import '../../test/dom';
import { expect } from 'chai';
import { Handsontable } from '../common';
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
    const grid = createGrid({ totalColumns: 10, totalRows: 5, values });
    expect(grid.isEditing).to.eql(false);
    expect(grid.totalColumns).to.eql(10);
    expect(grid.totalRows).to.eql(5);
    expect(grid.values).to.eql(values);
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

  it('cell', () => {
    const grid = createGrid();
    const cell = grid.cell({ row: 0, column: 0 });
    expect(cell.row).to.eql(0);
    expect(cell.column).to.eql(0);
    expect(cell.key).to.eql('A1');
  });

  it('toData', () => {});
});
