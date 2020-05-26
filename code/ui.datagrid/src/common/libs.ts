import * as util from '@platform/ui.datagrid.util';
export { util };

export * from './libs.Handsontable';
export * from './libs.cell';

/**
 * Util.
 */
import { css, color, style, CssValue, events, containsFocus, Keyboard } from '@platform/react';
export { css, color, style, CssValue, events, containsFocus, Keyboard };

import { value, time, defaultValue } from '@platform/util.value';
export { value, time, defaultValue };

import { log } from '@platform/log/lib/client';
export { log };

import { MemoryCache } from '@platform/cache';
export { MemoryCache };

/**
 * Cell coords (eg "A1", "A1:C9").
 */
import * as cell from './libs.cell';
export { cell };

/**
 * Ramda.
 */
import { clamp, clone, equals, flatten, pipe, prop, uniq, uniqBy } from 'ramda';
export const R = { clamp, clone, equals, flatten, prop, uniq, uniqBy, pipe };
