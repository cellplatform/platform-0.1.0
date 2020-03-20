import * as t from '../types';

export { Subject } from 'rxjs';
export { IMemoryCache } from '@platform/cache/lib/types';
export { IFs } from '@platform/fs.types';
export * from '@platform/cell.types';
export * from '@platform/fsdb.types';
export * from '../types';

/**
 * Schema
 */
export type SchemaFileType = 'FILE';
export type SchemaCoordType = 'CELL' | 'COL' | 'ROW';
export type SchemaType<T extends t.IUri> = t.IUriParts<T> & { path: string };

export type DbPathString = string;
export type UriString = string;

export type IPackage = {
  name: string;
  version: string;
  dependencies?: { [key: string]: string };
};
