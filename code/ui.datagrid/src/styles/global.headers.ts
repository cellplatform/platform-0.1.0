import { color, css, constants } from '../common';

const { CSS } = constants;

const COLORS = {
  HEADER: {
    SELECTED: color.format(-0.18),
    SELECTED_CELL: color.format(-0.1),
  },
};

const HEADER = {
  COLUMN: '.ht_clone_top table.htCore thead th',
  ROW: '.ht_clone_left table.htCore tbody th',
};

/**
 * Grid specific CSS overrides.
 */
const STYLES = {
  /**
   * `Column Header`
   */
  [`${HEADER.COLUMN}.ht__highlight`]: {
    // Header of selected cell.
    backgroundColor: COLORS.HEADER.SELECTED_CELL,
  },
  [`${HEADER.COLUMN}.ht__highlight.ht__active_highlight`]: {
    // Header of selected column.
    backgroundColor: COLORS.HEADER.SELECTED,
  },

  /**
   * `Row Header`
   */
  [`${HEADER.ROW}.ht__highlight`]: {
    // Header of selected cell.
    backgroundColor: COLORS.HEADER.SELECTED_CELL,
  },
  [`${HEADER.ROW}.ht__highlight.ht__active_highlight`]: {
    // Header of selected row.
    backgroundColor: COLORS.HEADER.SELECTED,
  },
};

/**
 * Initialize.
 */
css.global(STYLES, { prefix: `.${CSS.CLASS.GRID.BASE}.handsontable` });
