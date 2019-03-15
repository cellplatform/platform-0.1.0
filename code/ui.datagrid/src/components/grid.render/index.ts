import { registerCellRenderer } from './renderer.cell';

export * from './types';
export * from './constants';
export * from './renderer.cell';
export * from './renderer.header';

/**
 * Registers all avilable renderers.
 */
export function registerAll(Table: Handsontable) {
  registerCellRenderer(Table);
}
