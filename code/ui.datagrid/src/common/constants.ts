import { COLORS as COLORS_UTIL } from '@platform/ui.datagrid.util/lib/common/constants';
export const COLORS = { ...COLORS_UTIL };

export { ROBOTO, MONOSPACE } from '@platform/ui.text/lib/common/constants';
import * as t from './types';

export const UNKNOWN = 'UNKNOWN';

export const CSS = {
  CLASS: {
    GRID: {
      BASE: 'p-dg',
      EDITOR: 'p-dg-editor',
      FIRST: {
        ROW: 'p-dg-firstRow',
        COLUMN: 'p-dg-firstColumn',
      },
    },
    CELL: {
      MARKDOWN: 'p-editor-markdown', // See [@platform/ui.editor/lib/common/constants]
      BASE: 'p-dg-cell',
      DEFAULT: 'p-dg-cell-default',
      EDITOR: 'p-dg-cellEditor',
      BOLD: 'p-dg-cell-bold',
      ITALIC: 'p-dg-cell-italic',
      UNDERLINE: 'p-dg-cell-underline',
      FORMULA: 'p-dg-cell-formula',
      ERROR: 'p-dg-cell-error',
      // SCREEN: 'p-dg-cell-error',
    },
    EDITOR: {
      BASE: 'p-dg-cellEditor',
      DEFAULT: 'p-dg-cellEditor-default',
    },
    SCREEN: {
      BASE: 'p-dg-cellScreen',
      DEFAULT: 'p-dg-cellScreen-default',
    },
  },
};

const KEY_BINDINGS: t.KeyBindings<t.GridCommand> = [
  { command: 'CUT', key: 'Meta+X' },
  { command: 'COPY', key: 'Meta+C' },
  { command: 'PASTE', key: 'Meta+V' },
  { command: 'BOLD', key: 'Meta+B' },
  { command: 'ITALIC', key: 'Meta+I' },
  { command: 'UNDERLINE', key: 'Meta+U' },
];

type CellPropDefaults = {
  style: t.IGridCellPropsStyleAll;
  merge: t.IGridCellPropsMergeAll;
  view: t.IGridCellPropsViewAll;
};
const CELL_PROPS: CellPropDefaults = {
  style: { bold: false, italic: false, underline: false },
  merge: { rowspan: 1, colspan: 1 },
  view: {
    cell: { type: 'DEFAULT', className: CSS.CLASS.CELL.DEFAULT },
    editor: { type: 'DEFAULT', className: CSS.CLASS.EDITOR.DEFAULT },
    screen: { type: 'DEFAULT', className: CSS.CLASS.SCREEN.DEFAULT },
  },
};

const NS: t.INs = { id: UNKNOWN };

export const DEFAULT = {
  NS,
  KEY_BINDINGS,
  TOTAL_COLUMNS: 52,
  TOTAL_ROWS: 1000,
  ROW: {
    HEIGHT: 26,
    HEIGHT_MIN: 26,
  },
  COLUMN: {
    WIDTH: 120,
    WIDTH_MIN: 5,
  },
  CELL: {
    RENDERER: 'cell',
    PROPS: CELL_PROPS,
  },
};
