import { equals, clone, pipe, uniq, flatten } from 'ramda';
export const R = { equals, clone, pipe, uniq, flatten };

import { css, color, CssValue } from '@platform/css';
export { css, color, CssValue };

import { value, defaultValue, id } from '@platform/util.value';
export { value, defaultValue, id };
export const cuid = id.cuid;

import { Schema, Uri } from '@platform/cell.schema';
export { Schema, Uri };

import * as cell from './libs.cell';
export { cell };

import { func, coord } from './libs.cell';
export { func, coord };
