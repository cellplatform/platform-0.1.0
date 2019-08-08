import { INedbStore } from '@platform/fsdb.nedb/lib/types';

/**
 * [Store]
 */
export type IMongoStore<G = any> = INedbStore<G> & IMongoStoreMethods;
export type IMongoStoreMethods = {
  drop(): Promise<void>;
  exists(): Promise<boolean>;
};
