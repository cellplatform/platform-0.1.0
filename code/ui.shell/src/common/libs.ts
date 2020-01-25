import '@platform/polyfill';

export { css, color, CssValue, is } from '@platform/react';
export { time, defaultValue, id, props } from '@platform/util.value';
export { log } from '@platform/log/lib/client';
export { loader } from '@platform/ui.loader';

/**
 * Ramda
 */
import { clone } from 'ramda';
export const R = { clone };
