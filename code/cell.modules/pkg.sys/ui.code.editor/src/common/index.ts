import * as constants from './constants';
import * as t from './types';

export { t, constants };
export * from './libs';
export * from './Translate';
export * from './Is';
export * from './rx';

import { WebRuntime } from './libs';
export const bundle = WebRuntime.bundle;

export const DEFAULT = constants.DEFAULT;
export const COLORS = constants.COLORS;
