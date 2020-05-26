import { pipe, uniq, sortBy, prop } from 'ramda';
export const R = { pipe, uniq, sortBy, prop };

import { value, defaultValue, id } from '@platform/util.value';
export { value, defaultValue };
export const deleteUndefined = value.deleteUndefined;
export const cuid = id.cuid;
export const slug = id.shortid;

import { IFs } from '@platform/fs.types';
export { IFs };

import { Mime } from '@platform/util.mimetype';
export { Mime };

import { MemoryCache } from '@platform/cache/lib/MemoryCache';
export { MemoryCache };

import { wildcard } from '@platform/util.string/lib/wildcard';
export { wildcard };

import { queryString } from '@platform/util.string/lib/queryString';
export { queryString };

import { coord } from '@platform/cell.coord';
export { coord };
