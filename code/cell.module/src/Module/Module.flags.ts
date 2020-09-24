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
 * Retrieve the kind of module, if the module "kind" contains a suffix (eg "Module:<suffix>").
 * Empty string if no suffix or not a module node.
 */
export function kind(node?: t.INode) {
  return is.module(node) ? trimKindPrefix(nodeKind(node)) : '';
}

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

export function trimKindPrefix(value?: string) {
  return (value || '')
    .trim()
    .replace(/^Module\:?/, '')
    .trim();
}
