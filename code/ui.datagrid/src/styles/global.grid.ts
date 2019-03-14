import { color, COLORS, css, constants } from '../common';

/**
 * Common Styles.
 */
const styles = {
  resizer: { backgroundColor: COLORS.BLUE },
  resizerGuide: {
    backgroundColor: COLORS.BLUE,
    borderRightColor: COLORS.BLUE,
    borderBottomColor: COLORS.BLUE,
  },
  cellBorder: {
    borderColor: color.format(-0.15),
  },
};

/**
 * Grid specific CSS overrides.
 */
const GRID_GLOBAL = {
  /**
   * Row/column header styles.
   */
  'span.rowHeader, span.colHeader': {
    fontSize: 11,
    color: color.format(-0.7),
  },
  'span.colHeader': {
    position: 'relative',
    top: 4, // NB: Ensure vertically centered.
  },

  /**
   * Resize row/column.
   */
  '.manualColumnResizer:hover': styles.resizer,
  '.manualColumnResizer.active': styles.resizer,

  '.manualRowResizer:hover': styles.resizer,
  '.manualRowResizer.active': styles.resizer,

  '.manualColumnResizerGuide': styles.resizerGuide,
  '.manualRowResizerGuide': styles.resizerGuide,

  /**
   * Cell borders.
   */
  th: styles.cellBorder,
  td: styles.cellBorder,

  /**
   * Turn off top/left border on table.
   */
  'thead tr th': { borderTop: 'none', borderLeft: 'none' },
  'tbody tr th': { borderLeft: 'none' },
};

/**
 * Load styles into the <head>.
 */
css.global(GRID_GLOBAL, { prefix: `.${constants.CSS_CLASS.GRID} .handsontable` });
