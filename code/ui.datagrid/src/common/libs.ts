export * from './libs.Handsontable';

/**
 * Util.
 */
import * as util from '@platform/ui.datagrid.util';

export { util };
export { css, color, GlamorValue, events, containsFocus, Keyboard } from '@platform/react';
export { value, time, defaultValue } from '@platform/util.value';
export { log } from '@platform/log/lib/client';

/**
 * Cell coords (eg "A1", "A1:C9").
 */
import * as coord from '@platform/util.value.cell';
export { coord };

/**
 * Ramda.
 */
import { equals, clamp, uniq, flatten, uniqBy, prop } from 'ramda';
export const R = { equals, clamp, uniq, flatten, uniqBy, prop };
