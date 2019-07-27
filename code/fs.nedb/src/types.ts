import { IDb, IDbQuery } from '@platform/fs.db.types/lib/types';

export type INeDb = IDb<INeQuery>;

/**
 * Query
 */
export type INeQuery = IDbQuery & {
  foo?: boolean; // TEMP 🐷
};
