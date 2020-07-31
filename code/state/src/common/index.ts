import * as t from './types';
export { t };

import { is } from './is';
export { is };

/**
 * Util
 */
export const toNodeId = (node?: t.NodeIdentifier) => (typeof node === 'object' ? node.id : node);
