import { Grid, Editor } from '../../api';
import * as hooks from '../hooks';
import * as render from '../render';
import { constants } from '../../common';

const { DEFAULTS } = constants;

/**
 * Retrieves `handsontable` settings for a grid.
 */
export function getSettings(args: { totalColumns: number; getGrid: () => Grid }) {
  const { getGrid, totalColumns } = args;
  const selectionHandler = hooks.afterSelectionHandler(getGrid);

  const createColumns = (length: number) => {
    const col = {
      renderer: DEFAULTS.CELL_RENDERER,
      editor: Editor,
      width: (index: number) => {
        // console.log('get col width', index);
        return index === 0 ? 300 : DEFAULTS.COLUMN_WIDTHS;
      },
    };
    return Array.from({ length }).map(() => col);
  };

  const rowHeights: any = (index: number) => {
    // if (index === 1) {
    //   return 80;
    // }

    return DEFAULTS.ROW_HEIGHTS;
  };

  // const colWidths: any = (index: number) => {
  //   // if (index === 1) {
  //   //   return 380;
  //   // }
  //   console.log('colWidths', index);
  //   return DEFAULTS.COLUMN_WIDTHS;
  // };

  const settings: Handsontable.DefaultSettings = {
    data: [],

    rowHeaders: true,
    rowHeights,

    colHeaders: true,
    // colWidths,
    columns: createColumns(totalColumns),

    viewportRowRenderingOffset: 20,
    manualRowResize: true,
    manualColumnResize: true,
    renderAllRows: false, // Virtual scrolling.

    /**
     * Event Hooks
     * https://handsontable.com/docs/6.2.2/Hooks.html
     */
    beforeKeyDown: hooks.beforeKeyDownHandler(getGrid),
    beforeChange: hooks.beforeChangeHandler(getGrid),
    afterSelection: selectionHandler.select,
    afterDeselect: selectionHandler.deselect,
  };

  return settings;
}
