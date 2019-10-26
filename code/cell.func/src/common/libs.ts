import { equals, uniq } from 'ramda';
export const R = { equals, uniq };

export { coord } from '@platform/cell.coord';
export { value } from '@platform/cell.value';
export { value as valueUtil, defaultValue, time, id } from '@platform/util.value';
export { MemoryCache } from '@platform/cache';
