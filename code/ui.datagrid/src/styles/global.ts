import '../../static/css/handsontable.full.min.css';
import { ROBOTO } from '@platform/ui.text/lib/common/constants';
import { css, constants } from '../common';

const GRID_CASS = `.${constants.CSS_CLASS.GRID}`;

/**
 * Ensure required CSS style sheets are in the <head>.
 */
css.head.importStylesheet(ROBOTO.GOOGLE_FONTS.URL);

/**
 * Global CSS setup.
 */
const GLOBAL = {
  [GRID_CASS]: {
    fontFamily: ROBOTO.FAMILY,
  },
};

/**
 * Load styles into the <head>.
 */
css.global(GLOBAL);
