import * as constants from './constants';
import * as t from './types';

export { t, constants };
export const COLORS = constants.COLORS;

/**
 * Libs
 */
import { mergeDeepRight, clone } from 'ramda';
export const R = { mergeDeepRight, clone };
