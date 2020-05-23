import { style } from '..';
import { t } from '../common';

import { normalize } from './css.normalize';
import { global } from './css.global';

let isReset = false;

/**
 * Installs the reset stylesheets globally.
 */
export function reset() {
  if (!isReset) {
    style.global(normalize as t.CssPropsMap);
    style.global(global as t.CssPropsMap);
    isReset = true;
  }
}
