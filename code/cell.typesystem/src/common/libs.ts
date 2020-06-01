import { uniq, prop, sortBy, equals, groupBy } from 'ramda';
export const R = { prop, uniq, sortBy, equals, groupBy };

import { MemoryCache } from '@platform/cache';
export { MemoryCache };

import { Schema, Uri, squash, RefLinks } from '@platform/cell.schema';
export { Schema, Uri, squash, RefLinks };

import { coord } from '@platform/cell.coord';
export { coord };

import { value } from '@platform/util.value';
export { value };
export const deleteUndefined = value.deleteUndefined;
export const defaultValue = value.defaultValue;
