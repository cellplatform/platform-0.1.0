import * as util from '@platform/ui.datagrid.util';
import * as coord from '@platform/util.cell';

export * from './libs.Handsontable';

/**
 * Util.
 */
export { util };
export { css, color, GlamorValue, events, containsFocus, Keyboard } from '@platform/react';
export { value, time, defaultValue } from '@platform/util.value';
export { log } from '@platform/log/lib/client';
export { MemoryCache } from '@platform/cache';

/**
 * Cell coords (eg "A1", "A1:C9").
 */
export { coord };

/**
 * Ramda.
 */
import { clamp, clone, equals, flatten, prop, uniq, uniqBy, pipe } from 'ramda';
export const R = { clamp, clone, equals, flatten, prop, uniq, uniqBy, pipe };
