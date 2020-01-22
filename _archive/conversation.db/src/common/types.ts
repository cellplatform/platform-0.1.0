import { IDb } from '@platform/fsdb.types/lib/types';

export * from '../types';
export * from '@platform/fsdb.types/lib/types';
export * from '@platform/auth/lib/types';

export type GetDb = () => Promise<IDb>;
