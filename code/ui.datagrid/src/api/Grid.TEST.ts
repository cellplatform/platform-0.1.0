import '../../test/dom';
import { expect } from 'chai';
import { Handsontable } from '../common';
import { DefaultSettings } from 'handsontable';
import { Grid } from '.';

const createGrid = (settings: DefaultSettings = {}) => {
  const el = document.createElement('div');
  const table = new Handsontable(el, settings);
  return Grid.create({ table });
};

describe('Grid', () => {
  it('constructs', () => {
    const grid = createGrid();
    expect(grid.isEditing).to.eql(false);
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
});
