import { pipe, clone } from 'ramda';
export const R = { pipe, clone };

export { HttpClient } from '@platform/cell.client';
export { fs } from '@platform/fs';
export { FileCache, MemoryCache } from '@platform/cache';
export { Schema, Uri } from '@platform/cell.schema';
export { log } from '@platform/log/lib/server';
export { id, time, deleteUndefined, defaultValue } from '@platform/util.value';
