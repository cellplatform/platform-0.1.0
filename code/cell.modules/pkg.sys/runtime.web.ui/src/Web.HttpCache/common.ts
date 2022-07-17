import * as t from '../common/types';

export { WebRuntime } from '@platform/cell.runtime.web';
export { log } from '@platform/log/lib/client';
export { is as Is } from '@platform/util.is';
export { t };

/**
 * Constants
 */
export const QUERY = {
  cache: { key: 'cache', disabled: 'false' },
  clearCache: { keys: ['cache.clear', 'reset'] },
};
