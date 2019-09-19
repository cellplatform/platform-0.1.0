import { Grid } from '../api';
import { registerCellRenderer } from './render.cell';
import { FactoryManager } from '../factory';

export * from './types';
export * from './render.cell';
export * from './render.header';

/**
 * Registers all avilable renderers.
 */
export function registerAll(Table: Handsontable, grid: Grid, factory: FactoryManager) {
  registerCellRenderer(Table, grid, factory);
}
