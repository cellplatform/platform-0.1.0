export { diff } from '@platform/util.diff';
export { hash } from '@platform/util.hash';
export { value, defaultValue } from '@platform/util.value';

import * as cell from './libs.cell';
export { cell };

/**
 * Ramda.
 */
import { equals, flatten } from 'ramda';
export const R = { equals, flatten };
