export { is } from '@platform/util.is';
export { value as valueUtil } from '@platform/util.value';

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
