import { pipe, clone, uniq } from 'ramda';
export const R = { pipe, clone, uniq };

/**
 * @platform
 */
export { Http } from '@platform/http';
export { HttpClient } from '@platform/cell.client';
export { fs } from '@platform/fs';
export { FileCache, MemoryCache } from '@platform/cache';
export { Schema, Uri, Hash } from '@platform/cell.schema';
export { log } from '@platform/log/lib/server';
export { time, deleteUndefined, defaultValue, rx, cuid, slug } from '@platform/util.value';
