export * from '@platform/cli.spec';
export { GlamorValue, css, color, events, containsFocus, Keyboard } from '@platform/react';
export { str } from '@platform/util.string';
export { value } from '@platform/util.value';
export { localStorage } from '@platform/util.local-storage';

/**
 * [Ramda]
 */
import { equals } from 'ramda';
export const R = { equals };
