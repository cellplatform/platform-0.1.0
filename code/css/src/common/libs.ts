/* eslint-disable @typescript-eslint/ban-ts-comment */

import { is } from '@platform/util.is';
export { is };

import { value as valueUtil } from '@platform/util.value';
export { valueUtil };

/**
 * [Ramda]
 */
import { isEmpty } from 'ramda';
export const R = { isEmpty };

/**
 * Wrapper around JSS to support old Glamor API.
 */
// @ts-ignore
import jss = require('glamor-jss');
export { jss };
