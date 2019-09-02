export { ROBOTO, MONOSPACE } from '@platform/ui.text/lib';

export const COLORS = {
  WHITE: '#fff',
  DARK: '#293042', // Inky blue/black.
  YELLOW: '#FBC72F',
  BLUE: '#4B89FF',
  PINK: '#FF0048',
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
      BASE: 'p-dg-cell',
      EDITOR: 'p-dg-cellEditor',
      MARKDOWN: 'p-editor-markdown', // See [@platform/ui.editor/lib/common/constants]
    },
  },
};

export const DEFAULT = {
  CELL_RENDERER: 'cell',
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
};
