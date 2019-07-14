export * from '@platform/fs.db.types/lib/types';
export * from '@platform/types';

export * from '../types';

import { Json } from '@platform/types';
import { IDbTimestamps } from '@platform/fs.db.types/lib/types';

export type IDoc<D = Json> = IDbTimestamps & {
  path: string;
  data?: D;
};
