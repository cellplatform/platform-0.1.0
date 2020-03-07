import { pipe, uniq } from 'ramda';
export const R = { pipe, uniq };

export { coord } from './libs.cell';

export { defaultValue, value } from '@platform/util.value';

import { id } from '@platform/util.value';
export const cuid = id.cuid;
export const slug = id.shortid;

export { wildcard } from '@platform/util.string/lib/wildcard';
