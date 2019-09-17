export { ROBOTO, MONOSPACE } from '@platform/ui.text/lib';
import * as t from './types';

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
      MARKDOWN: 'p-editor-markdown', // See [@platform/ui.editor/lib/common/constants]
      BASE: 'p-dg-cell',
      EDITOR: 'p-dg-cellEditor',
      BOLD: 'p-dg-cell-bold',
      ITALIC: 'p-dg-cell-italic',
      UNDERLINE: 'p-dg-cell-underline',
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

export const DEFAULT = {
  KEY_BINDINGS,
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
