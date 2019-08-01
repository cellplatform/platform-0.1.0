import { IDb, IDbQuery } from '@platform/fsdb.types/lib/types';

export type INeDb = IDb<INeQuery>;

/**
 * Query
 */
export type INeQuery = IDbQuery & {
  filter?: INeQueryFilter;
};

export type INeQueryFilter = {
  [field: string]: INeQueryOperators | string | number | boolean | null | undefined;
};

/**
 * - https://github.com/louischatriot/nedb/#operators-lt-lte-gt-gte-in-nin-ne-exists-regex
 */
export type INeQueryOperators = {
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
  $elemMatch?: INeQueryOperators;

  // Logical operators.
  $or?: INeQueryOperators;
  $and?: INeQueryOperators;
  $not?: INeQueryOperators;
  $where?: () => boolean;
};
