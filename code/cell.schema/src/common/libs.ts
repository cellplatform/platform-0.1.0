import { pipe, uniq, sortBy, prop, clone } from 'ramda';
export const R = { pipe, uniq, sortBy, prop, clone };

import { value, defaultValue, id } from '@platform/util.value';
export { value, defaultValue };
export const deleteUndefined = value.deleteUndefined;
export const cuid = id.cuid;
export const slug = id.shortid;

export { Mime } from '@platform/util.mimetype';
export { MemoryCache } from '@platform/cache/lib/MemoryCache';
export { wildcard } from '@platform/util.string/lib/wildcard';
export { QueryString } from '@platform/util.string/lib/QueryString';
export { coord } from '@platform/cell.coord';
