import { uniq, prop, sortBy, equals, groupBy } from 'ramda';
export const R = { prop, uniq, sortBy, equals, groupBy };

export { MemoryCache } from '@platform/cache';
export { Schema, Uri, Squash, RefLinks } from '@platform/cell.schema';
export { coord, CellRange } from '@platform/cell.coord';
export { value, rx, deleteUndefined, defaultValue } from '@platform/util.value';
