export { fs } from '@platform/fs';
export { defaultValue, time } from '@platform/util.value';

export * from '@platform/fs.db.types/lib/common';
export { DbUri } from '@platform/fs.db.types';

/**
 * Ramda
 */
import { uniq } from 'ramda';
export const R = { uniq };
