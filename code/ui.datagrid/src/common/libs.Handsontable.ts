/**
 * Handsontable
 *  - https://github.com/handsontable/handsontable
 *  - https://github.com/handsontable/react-handsontable (not used, ref only)
 *
 * LICENSE (MIT)
 *    The version of Handsontable being imported here is `6.2.2`
 *    This is the last version released under the MIT license.
 */

/**
 * [HACK]
 *    Prior to importing `noConflict` we were experiencing a load error
 *    related to the module not found.
 */
import '@babel/polyfill/lib/noConflict';

/**
 * [HACK]
 *    Imported via `require` statement as this causes less problems with
 *    JS bunders (parceljs) when importing this module externally.
 */
// @ts-ignore
import Types from 'handsontable'; // tslint:disable-line
const Lib = require('handsontable') as Types;

export const Handsontable = typeof Lib.default === 'function' ? Lib.default : Lib;
