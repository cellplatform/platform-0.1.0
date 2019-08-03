import { PgDoc } from './PgDoc';

export * from '@platform/fsdb.types/lib/types';
export * from './types';
export * from './PgDoc';
export * from './fs';

export const create = PgDoc.create;
