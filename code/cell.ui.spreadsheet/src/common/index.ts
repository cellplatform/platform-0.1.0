import '../config';
import * as t from './types';
import * as constants from './constants';

export { t, constants };
export const COLORS = constants.COLORS;

/**
 * Util
 */
import { onStateChanged } from './util';
export { onStateChanged };

/**
 * Libs
 */
import { Client, Schema, Uri, TypeSystem } from '@platform/cell.client';
export { Client, Schema, Uri, TypeSystem };

import { css, color, CssValue } from '@platform/css';
export { css, color, CssValue };

import { coord } from '@platform/cell.coord';
export { coord };

import { flatten } from 'ramda';
export const R = { flatten };

import datagrid from '@platform/ui.datagrid';
export { datagrid };

import { rx, id, time } from '@platform/util.value';
export { rx, id, time };

import { ui } from '@platform/cell.ui';
export { ui };
