import { equals, clone, pipe, uniq, flatten } from 'ramda';
export const R = { equals, clone, pipe, uniq, flatten };

export { css, GlamorValue, color } from '@platform/react';
export { value, defaultValue } from '@platform/util.value';

import * as cell from './libs.cell';
export { cell };
export { func, coord } from './libs.cell';
