import { value } from '@platform/util.value';

export { value };
export { color, css, GlamorValue, mouse } from '@platform/react';

export const defaultValue = value.defaultValue;

/**
 * [Ramda]
 */
import { mergeDeepRight, clone } from 'ramda';
export const R = { mergeDeepRight, clone };
