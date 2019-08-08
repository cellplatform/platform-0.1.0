import { IDb, IDbQuery } from '@platform/fsdb.types/lib/types';

export type INeDb = IDb<INedbQuery>;

/**
 * Query
 */
export type INedbQuery = IDbQuery & {
  filter?: INedbQueryFilter;
};

export type INedbQueryFilter = {
  [field: string]: INedbQueryOperators | string | number | boolean | null | undefined;
};

/**
 * Ensure index.
 */
export type INedbEnsureIndexOptions = {
  fieldName: string;
  unique?: boolean;
  sparse?: boolean;
  expireAfterSeconds?: number;
};

/**
 * - https://github.com/louischatriot/nedb/#operators-lt-lte-gt-gte-in-nin-ne-exists-regex
 */
export type INedbQueryOperators = {
  $lt?: number;
  $lte?: number;
  $gt?: number;
  $gte?: number;
  $in?: any[];
  $nin?: any[];
  $ne?: any;
  $exists?: boolean;
  $regex?: RegExp;

  // Array.
  $size?: number;
  $elemMatch?: INedbQueryOperators;

  // Logical operators.
  $or?: INedbQueryOperators;
  $and?: INedbQueryOperators;
  $not?: INedbQueryOperators;
  $where?: () => boolean;
};

/**
 * Store (underlying DB connector).
 */
export type INedbStoreArgs =
  | string
  | { autoload?: boolean; filename?: string; onload?: (err: Error) => void };

export type INedbStore<G = any> = {
  insert<T extends G>(doc: T, options?: { escapeKeys?: boolean }): Promise<T>;
  insertMany<T extends G>(doc: T[], options?: { escapeKeys?: boolean }): Promise<T[]>;

  updateOne<T extends G>(
    query: any,
    update: any,
    options?: INedbStoreUpdateOptions,
  ): Promise<INedbStoreUpdateResponse<T>>;

  find<T extends G>(query: any): Promise<T[]>;
  findOne<T extends G>(query: any): Promise<T | undefined>;

  remove(query: any, options?: INedbStoreRemoveOptions): Promise<INedbStoreRemoveResponse>;
  ensureIndex(options: INedbEnsureIndexOptions): Promise<{}>;
};

/**
 * Update.
 */
export type INedbStoreUpdateResponse<T> = {
  modified: boolean;
  upsert: boolean;
  doc?: T;
};

export type INedbStoreUpdateOptions = {
  upsert?: boolean;
};

/**
 * Remove.
 */
export type INedbStoreRemoveResponse = { total: number };
export type INedbStoreRemoveOptions = { multi?: boolean };
