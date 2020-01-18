import * as t from '../types';

export * from '@platform/cell.types';
export * from '@platform/fsdb.types';
export * from '../types';

export type UrlQuery = { [key: string]: any };

/**
 * Schema
 */
export type SchemaFileType = 'FILE';
export type SchemaCoordType = 'CELL' | 'COL' | 'ROW';
export type SchemaType<T extends t.IUri> = t.IUriParts<T> & { path: string };

export type DbPathString = string;
export type UriString = string;
