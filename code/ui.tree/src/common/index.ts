import * as t from './types';
import * as constants from './constants';

export { t, constants };
export const COLORS = constants.COLORS;

/**
 * Libs
 */
import { time, rx, defaultValue } from '@platform/util.value';
export { time, rx, defaultValue };

/**
 * Util
 */
export const toId = (node?: t.NodeIdentifier) => (typeof node === 'object' ? node.id : node);
