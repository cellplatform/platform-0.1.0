import { IDb } from '@platform/fs.db.types/lib/types';

export * from '../types';
export * from '@platform/fs.db.types/lib/types';
export * from '@platform/auth/lib/types';

export type GetDb = () => Promise<IDb>;
