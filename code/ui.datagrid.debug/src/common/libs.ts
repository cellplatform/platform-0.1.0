import { equals, clone, pipe, uniq, flatten } from 'ramda';
export const R = { equals, clone, pipe, uniq, flatten };

export { css, CssValue, color } from '@platform/react';
export { value, defaultValue, id } from '@platform/util.value';
export { Schema, Uri } from '@platform/cell.schema';

import { id } from '@platform/util.value';
export const cuid = id.cuid;

import * as cell from './libs.cell';
export { cell };
export { func, coord } from './libs.cell';
