export * from '@platform/fs.db.types/lib/types';
import { IDbValue } from '@platform/fs.db.types/lib/types';

/**
 * Cache
 */
export type IFileDbCache = {
  isEnabled: boolean;
  values: { [key: string]: IDbValue };
  exists(key: string): boolean;
  clear(keys?: string[]): void;
};
