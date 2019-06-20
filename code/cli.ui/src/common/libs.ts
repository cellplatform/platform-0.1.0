import { value } from '@platform/util.value';
export { value };
export const defaultValue = value.defaultValue;

export * from '@platform/cli.spec';
export { GlamorValue, css, color, events, containsFocus, Keyboard } from '@platform/react';
export { str } from '@platform/util.string';

/**
 * [Ramda]
 */
import { equals } from 'ramda';
export const R = { equals };
