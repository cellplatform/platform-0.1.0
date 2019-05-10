import { IDb } from '@platform/hyperdb.types/lib/types';

export * from '../types';
export * from '@platform/hyperdb.types/lib/types';
export * from '@platform/auth/lib/types';

export type GetDb = () => Promise<IDb>;
