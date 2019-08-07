export * from '@platform/fsdb.types/lib/types';
export * from '@platform/types';

export * from '../types';
export * from '../store/types';

import { Json } from '@platform/types';
import { IDbTimestamps } from '@platform/fsdb.types/lib/types';

export type IDoc<D = Json> = IDbTimestamps & {
  _id: string; // "path" field.
  data?: D;
};
