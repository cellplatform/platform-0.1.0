import { t, coord, util } from '../common';
import { Grid } from '../api';

const defaultFactory: t.GridFactory = req => null;

/**
 * Manager for grid component factories.
 */
export class FactoryManager {
  /**
   * [Constructor]
   */
  constructor(args: { grid: Grid; factory?: t.GridFactory }) {
    this.grid = args.grid;
    this.factory = args.factory || defaultFactory;
  }

  /**
   * [Fields]
   */
  public readonly grid: Grid;
  public readonly factory: t.GridFactory;

  /**
   * [Methods]
   */

  /**
   * Generates a cell editor.
   */
  public editor(args: { row: number; column: number; cell?: t.IGridCellData }) {
    return this.render({ ...args, type: 'EDITOR' });
  }

  /**
   * Generates the display for a single cell
   */
  public cell(args: { row: number; column: number; cell?: t.IGridCellData }) {
    return this.render({ ...args, type: 'CELL' });
  }

  /**
   * [Internal]
   */
  private render(args: {
    type: t.GridFactoryType;
    row: number;
    column: number;
    cell?: t.IGridCellData;
  }) {
    const { type, row, column } = args;
    const key = coord.cell.toKey(column, row);
    const grid = this.grid;

    const props = util.toGridCellProps(args.cell ? args.cell.props : {});
    const data: t.IGridCellData<t.IGridCellPropsAll> = { ...args.cell, props };
    const cell: t.IGridFactoryRequest['cell'] = { key, props, data };

    const req: t.IGridFactoryRequest = { type, grid, cell };
    return this.factory(req);
  }
}
