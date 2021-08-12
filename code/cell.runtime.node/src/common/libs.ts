import { pipe, clone, uniq } from 'ramda';
export const R = { pipe, clone, uniq };

export { HttpClient } from '@platform/cell.client';
export { fs } from '@platform/fs';
export { FileCache, MemoryCache } from '@platform/cache';
export { Schema, Uri } from '@platform/cell.schema';
export { log } from '@platform/log/lib/server';
export { time, deleteUndefined, defaultValue, rx, cuid, slug } from '@platform/util.value';
