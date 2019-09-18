import { t } from '../../common';
import { Grid } from '../../api';

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
  public editor(args: { row: number; column: number; cell?: t.IGridCell }) {
    return this.render({ ...args, type: 'EDITOR' });
  }

  /**
   * Generates the display for a single cell
   */
  public cell(args: { row: number; column: number; cell?: t.IGridCell }) {
    return this.render({ ...args, type: 'CELL' });
  }

  /**
   * [Internal]
   */
  private render(args: {
    type: t.GridFactoryType;
    row: number;
    column: number;
    cell?: t.IGridCell;
  }) {
    const { type, row, column, cell } = args;
    const grid = this.grid;
    return this.factory({ type, row, column, grid, cell });
  }
}
