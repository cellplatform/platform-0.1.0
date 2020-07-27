import * as t from './types';
export { t };

/**
 * Util
 */
export const toNodeId = (node?: t.NodeIdentifier) => (typeof node === 'object' ? node.id : node);
