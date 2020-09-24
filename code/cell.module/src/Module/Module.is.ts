import { t } from '../common';

export const is: t.Module['is'] = {
  /**
   * Determine if the given event is a [Module] system event.
   */
  moduleEvent(event?: t.Event) {
    return event?.type.startsWith('Module/') || false;
  },

  /**
   * Determine if the given node represents a Module.
   */
  module(node?: t.INode) {
    const kind = nodeKind(node);
    return kind === 'Module' || kind.startsWith('Module:');
  },
};

/**
 * [Helpers]
 */

export function nodeKind(node?: t.INode) {
  if (typeof node !== 'object' || node === null) {
    return '';
  } else {
    const kind = node.props?.kind;
    return typeof kind === 'string' ? kind.trim() : '';
  }
}
