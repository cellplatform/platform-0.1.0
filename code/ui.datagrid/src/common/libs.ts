/**
 * Handsontable
 *  - https://github.com/handsontable/handsontable
 *  - https://github.com/handsontable/react-handsontable (not used, ref only)
 */

// HACK - was experiencing a load error related to the module not found.
import '@babel/polyfill/lib/noConflict';

// @ts-ignore
import Handsontable from 'handsontable';
export { Handsontable };

// HACK: Import 'handsontable' like this to make types available globally.
import 'handsontable'; // tslint:disable-line

/**
 * Util.
 */
export { css, color, GlamorValue, events, containsFocus, Keyboard } from '@platform/react';
export { value, time, defaultValue } from '@platform/util.value';
export { log } from '@platform/log/lib/client';

/**
 * Ramda.
 */
import { equals, clamp } from 'ramda';
export const R = { equals, clamp };

/**
 * Cell coords (eg "A1", "A1:C9")
 */
import * as coord from '@platform/util.value.cell';
export { coord };
