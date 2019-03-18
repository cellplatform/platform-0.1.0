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
  public editor(args: { row: number; column: number }) {
    const { row, column } = args;
    const grid = this.grid;
    return this.factory({ type: 'EDITOR', row, column, grid });
  }
}
