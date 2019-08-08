import { INedbStore, INeDb } from '@platform/fsdb.nedb/lib/types';

/**
 * [Mongo]
 */
export type IMongoDb = INeDb;

/**
 * [Store]
 */
export type IMongoStore<G = any> = INedbStore<G> & IMongoStoreMethods;
export type IMongoStoreMethods = {
  drop(): Promise<void>;
  exists(): Promise<boolean>;
};
