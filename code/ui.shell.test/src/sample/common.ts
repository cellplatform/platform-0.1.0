import '@platform/libs/polyfill';
import * as t from './types';

export { loader } from '@platform/ui.loader';
// export * from '../common';
export { shell } from '@platform/ui.shell';

export { t };

export const COLORS = {
  WHITE: '#FFF',
  DARK: '#293042', // Inky blue/black.
  BLUE: '#4B89FF',
};

export { css, color, GlamorValue, is } from '@platform/react';
export { time, defaultValue, id, props } from '@platform/util.value';
export { log } from '@platform/log/lib/client';

/**
 * Ramda
 */
import { clone } from 'ramda';
export const R = { clone };
