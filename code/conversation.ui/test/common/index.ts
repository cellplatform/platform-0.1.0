import '../../node_modules/@platform/css/reset.css';
import '@babel/polyfill';

import * as t from './types';
import * as constants from './constants';
import * as conversation from '../../src';

export * from './types';
export * from './libs';

export * from '../../src/common';
export * from '../../src';

export { t, constants, conversation };

export const LOREM = constants.LOREM;
export const PEOPLE = constants.PEOPLE;
