import * as t from './types';
export { t };

/**
 * Util
 */
export const toId = (node?: t.NodeIdentifier) => (typeof node === 'object' ? node.id : node);
