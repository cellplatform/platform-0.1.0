import { Grid } from '../../api';
import { registerCellRenderer } from './render.cell';

export * from './types';
export * from './constants';
export * from './render.cell';
export * from './render.header';

/**
 * Registers all avilable renderers.
 */
export function registerAll(Table: Handsontable, grid: Grid) {
  registerCellRenderer(Table, grid);
}
