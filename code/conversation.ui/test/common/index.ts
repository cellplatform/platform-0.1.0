import '../../node_modules/@platform/css/reset.css';
import '@babel/polyfill';

import * as t from './types';
import * as constants from './constants';

export * from './types';
export * from './libs';

export * from '../../src/common';
export * from '../../src';

export { t, constants };

export const LOREM = constants.LOREM;
