import { Editor, Grid } from '../api';
import { constants, coord } from '../common';
import * as hooks from './hooks';

const { DEFAULT } = constants;

/**
 * Retrieves `handsontable` settings for a grid.
 */
export function getSettings(args: { grid: Grid }) {
  const { grid } = args;
  const selectionHandler = hooks.afterSelectionHandler(grid);

  const createColumns = (length: number) => {
    const col = {
      renderer: DEFAULT.CELL.RENDERER,
      editor: Editor,
    };
    return Array.from({ length }).map(() => col);
  };

  const rowHeights: any = (index: number) => {
    let height = grid.defaults.rowHeight;
    if (grid.isInitialized) {
      const row = grid.rows[index];
      const props = row ? row.props : undefined;
      height = props && props.height !== undefined ? props.height : height;
    }
    return height;
  };

  const colWidths: any = (index: number) => {
    let width = grid.defaults.columnWidth;
    if (grid.isInitialized) {
      const key = coord.cell.toKey(index);
      const column = grid.columns[key];
      const props = column ? column.props : undefined;
      width = props && props.width !== undefined ? props.width : width;
    }
    return width;
  };

  const size = hooks.sizeHandlers(grid);
  const { afterColumnResize, afterRowResize, modifyColWidth, modifyRowHeight } = size;
  const { afterSelection, afterDeselect } = selectionHandler;

  const settings: Handsontable.DefaultSettings = {
    data: [],

    rowHeaders: true,
    rowHeights,

    colHeaders: true,
    colWidths,
    columns: createColumns(grid.totalColumns),

    viewportRowRenderingOffset: 20,
    manualRowResize: true,
    manualColumnResize: true,
    renderAllRows: false, // Virtual scrolling.
    undo: false, // Handled manually through events.

    /**
     * Event Hooks.
     * - https://handsontable.com/docs/6.2.2/Hooks.html
     */
    beforeKeyDown: hooks.beforeKeyDownHandler(grid),
    afterSelection,
    afterDeselect,
    afterColumnResize,
    afterRowResize,
    modifyColWidth,
    modifyRowHeight,

    /**
     * Fill handle.
     * - https://handsontable.com/docs/6.2.2/demo-auto-fill.html
     */
    fillHandle: true,

    beforeAutofill(...args) {
      console.log('beforeAutofill', args);
      return false;
    },

    beforeAutofillInsidePopulate(...args) {
      console.log('beforeAutofillInsidePopulate', args);
      return false;
    },

    // modifyAutofillRange(...args) {
    //   console.log('modifyAutofillRange', args);
    // },

    // Mouse.
    beforeOnCellMouseDown: hooks.mouseCell(grid, 'DOWN'),
    beforeOnCellMouseUp: hooks.mouseCell(grid, 'UP'),
    beforeOnCellMouseOver: hooks.mouseCell(grid, 'ENTER'),
    beforeOnCellMouseOut: hooks.mouseCell(grid, 'LEAVE'),

    // Undo.
    beforeUndo: hooks.undo(grid, 'BEFORE', 'UNDO'),
    afterUndo: hooks.undo(grid, 'AFTER', 'UNDO'),
    beforeRedo: hooks.undo(grid, 'BEFORE', 'REDO'),
    afterRedo: hooks.undo(grid, 'AFTER', 'REDO'),
  };

  return settings;
}
