export { fs } from '@platform/fs';
export { defaultValue, time } from '@platform/util.value';

export * from '@platform/fsdb.types/lib/common';
export { DbUri } from '@platform/fsdb.types';

/**
 * Ramda
 */
import { uniq } from 'ramda';
export const R = { uniq };
