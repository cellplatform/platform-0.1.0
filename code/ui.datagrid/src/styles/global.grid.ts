import { color, COLORS, css, constants } from '../common';

const { CSS, ROBOTO } = constants;
const BLUE = COLORS.BLUE;

/**
 * Common Styles.
 */
const COMMON = {
  resizer: { backgroundColor: BLUE },
  resizerGuide: {
    backgroundColor: BLUE,
    borderRightColor: BLUE,
    borderBottomColor: BLUE,
  },
};

/**
 * Grid specific CSS overrides.
 */
const STYLES = {
  '': {
    // Root level styles on grid <div>.
    fontFamily: ROBOTO.FAMILY,
  },

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
  '.manualColumnResizer:hover': COMMON.resizer,
  '.manualColumnResizer.active': COMMON.resizer,

  '.manualRowResizer:hover': COMMON.resizer,
  '.manualRowResizer.active': COMMON.resizer,

  '.manualColumnResizerGuide': COMMON.resizerGuide,
  '.manualRowResizerGuide': COMMON.resizerGuide,

  /**
   * Cells.
   */
  th: {
    borderColor: color.format(-0.15),
  },
  td: {
    position: 'relative',
    borderColor: color.format(-0.1),
    padding: 0,
  },

  /**
   * Turn off top/left border on table.
   */
  'thead tr th': { borderTop: 'none', borderLeft: 'none' },
  'tbody tr th': { borderLeft: 'none' },
};

/**
 * Initialize.
 */
css.global(STYLES, { prefix: `.${CSS.CLASS.GRID.BASE}.handsontable` });
