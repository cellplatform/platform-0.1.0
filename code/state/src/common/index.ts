import * as t from './types';
export { t };

import { is } from './is';
export { is };

/**
 * Util
 */
export const toNodeId = (node?: t.NodeIdentifier) => {
  if (node === null) {
    return '';
  }
  if (typeof node === 'string') {
    return node;
  }
  if (typeof node === 'object') {
    return node.id;
  }
  return '';
};
