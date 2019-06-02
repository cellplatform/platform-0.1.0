import '../../node_modules/@platform/css/reset.css';
import '@babel/polyfill';

import * as t from '../types';

export * from './libs';
export * from '../../src';
export * from '../../src/tools';
export { t };

export const COLORS = {
  WHITE: '#fff',
  DARK: '#293042', // Black with a slight blue tinge.
};
