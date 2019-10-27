export { ROBOTO, MONOSPACE } from '@platform/ui.text/lib';
import * as t from './types';

export const COLORS = {
  WHITE: '#fff',
  DARK: '#293042', // Inky blue/black.
  BLUE: '#4B89FF',
  CLI: {
    BLUE: '#477AF7',
    YELLOW: '#FBC72F',
    MAGENTA: '#FE0064',
    CYAN: '#67D9EF',
    LIME: '#A6E130',
    DARK_RED: '#CB352F',
    PURPLE: '#8F2298',
    PINK: '#DC6FEC',
  },
};

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
      DEFAULT: 'p-dg-cellEditor-default',
    },
    SCREEN: {
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

export const DEFAULT = {
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
