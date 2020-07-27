import * as t from './types';
import * as constants from './constants';

export { t, constants };
export const COLORS = constants.COLORS;

/**
 * Libs
 */
import { time, rx, defaultValue } from '@platform/util.value';
export { time, rx, defaultValue };

import { StateObject } from '@platform/state/lib/StateObject';
export { StateObject };

import { TreeQuery } from '@platform/state/lib/TreeQuery';
export { TreeQuery };

import { TreeState } from '@platform/state/lib/TreeState';
export { TreeState };

/**
 * Util
 */
export const toId = (node?: t.NodeIdentifier) => (typeof node === 'object' ? node.id : node);
