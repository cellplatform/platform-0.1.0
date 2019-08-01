export * from '@platform/fsdb.types/lib/types';
import { IDbValue } from '@platform/fsdb.types/lib/types';

/**
 * Cache
 */
export type IFileDbCache = {
  isEnabled: boolean;
  values: { [key: string]: IDbValue };
  exists(key: string): boolean;
  clear(keys?: string[]): void;
};

/**
 * Schema
 */
export type IFileDbSchema = {
  paths: IFileDbSchemaPaths;
};

export type IFileDbSchemaPaths = { [key: string]: IFileDbSchemaPath };
export type IFileDbSchemaPath = { file: string };
