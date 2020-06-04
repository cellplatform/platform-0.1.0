import '../config';

import * as t from './types';
import * as constants from './constants';

export { t, constants };
export * from './util';
export * from './util.error';
export const COLORS = constants.COLORS;

/**
 * Libs
 */
import { Client, Schema, Uri, TypeSystem } from '@platform/cell.client';
export { Client, Schema, Uri, TypeSystem };

import { css, color, CssValue } from '@platform/css';
export { css, color, CssValue };

import { value, time, defaultValue, rx } from '@platform/util.value';
export { value, time, defaultValue, rx };

import { ui } from '@platform/cell.ui';
export { ui };

import { log } from '@platform/log/lib/client/log';
export { log };

import { equals } from 'ramda';
export const R = { equals };
