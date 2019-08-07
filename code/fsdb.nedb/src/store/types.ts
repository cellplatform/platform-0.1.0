/**
 * Store
 */
export type IStoreArgs =
  | string
  | { autoload?: boolean; filename?: string; onload?: (err: Error) => void };

export type IStore<G = any> = {
  insert<T extends G>(doc: T, options?: { escapeKeys?: boolean }): Promise<T>;
  insertMany<T extends G>(doc: T[], options?: { escapeKeys?: boolean }): Promise<T[]>;
  update<T extends G>(
    query: T | T[],
    updates: T | T[],
    options?: IStoreUpdateOptions,
  ): Promise<IStoreUpdateResponse<T>>;
  find<T extends G>(query: any): Promise<T[]>;
  findOne<T extends G>(query: any): Promise<T>;
  remove(query: any, options?: IStoreRemoveOptions): Promise<IStoreRemoveResponse>;
  ensureIndex(options: t.INedbEnsureIndexOptions): Promise<{}>;
};

/**
 * Update.
 */
export type IStoreUpdateResponse<T> = {
  total: number;
  upsert: boolean;
  docs: T[];
};

export type IStoreUpdateOptions = {
  multi?: boolean;
  upsert?: boolean;
  returnUpdatedDocs?: boolean;
};


/**
 * Remove.
 */
export type IStoreRemoveResponse = { total: number };
export type IStoreRemoveOptions = { multi?: boolean };
