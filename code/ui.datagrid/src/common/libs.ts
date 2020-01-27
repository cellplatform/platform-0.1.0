import * as util from '@platform/ui.datagrid.util';

export * from './libs.Handsontable';

/**
 * Util.
 */
export { util };
export { css, color, style, CssValue, events, containsFocus, Keyboard } from '@platform/react';
export { value, time, defaultValue } from '@platform/util.value';
export { log } from '@platform/log/lib/client';
export { MemoryCache } from '@platform/cache';

/**
 * Cell coords (eg "A1", "A1:C9").
 */
import * as cell from './libs.cell';
export { cell };
export * from './libs.cell';

/**
 * Ramda.
 */
import { clamp, clone, equals, flatten, pipe, prop, uniq, uniqBy } from 'ramda';
export const R = { clamp, clone, equals, flatten, prop, uniq, uniqBy, pipe };
