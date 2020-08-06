import { TreeState } from '@platform/state';

import { t } from '../common';
import * as events from './Module.events';

type O = Record<string, unknown>;
type Event = t.Event<O>;

/**
 * Create a new module
 */
export function create<D extends O, A extends Event = any>(
  args?: t.ModuleArgs<D>,
): t.IModule<D, A> {
  args = { ...args };
  args.root = formatRootNode<D>(args.root || 'module');
  const strategy = args.strategy;
  delete args.strategy;

  const module = TreeState.create<t.ITreeNodeModule<D>>(args) as t.IModule<D, A>;
  events.monitorAndDispatchChanged(module);

  if (strategy) {
    strategy(module);
  }

  return module;
}

/**
 * Prepare a tree-node to represent the root of a MODULE.
 */
export function formatRootNode<D extends O = any>(input: t.ITreeNode | string) {
  const node = typeof input === 'string' ? { id: input } : { ...input };

  type M = t.ITreeNodeModule<D>;
  const props = (node.props = node.props || {}) as NonNullable<M['props']>;
  props.kind = 'MODULE';
  props.data = (props.data || {}) as D;
  props.view = props.view || '';
  props.treeview = props.treeview || { label: 'Unnamed' };

  return node as M;
}
