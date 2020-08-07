import { TreeState } from '@platform/state';
import { takeUntil } from 'rxjs/operators';

import { rx, t } from '../common';
import * as events from './Module.events';

type O = Record<string, unknown>;

/**
 * Create a new module
 */
export function create<D extends O>(args?: t.ModuleArgs<D>): t.IModule<D> {
  args = { ...args };
  args.root = formatModuleNode<D>(args.root || 'module');

  const module = TreeState.create<t.IModuleTreeNode<D>>(args) as t.IModule<D>;
  events.monitorAndDispatch(module);

  if (args.event$) {
    const $ = args.event$.pipe(takeUntil(module.dispose$));

    // Listem for request events, and lookup to see if
    // the module can be resolved within the child set.
    rx.payload<t.IModuleRequestEvent>($, 'Module/request').subscribe((e) => {
      const child = module.find((child) => child.id === e.module);
      if (child) {
        const path = module.path.get(child);
        e.response({ module: child, path });
      }
    });
  }

  return module;
}

/**
 * Prepare a tree-node to represent the root of a MODULE.
 */
export function formatModuleNode<D extends O = any>(
  input: t.ITreeNode | string,
  defaults: { label?: string; view?: string; data?: D } = {},
) {
  const { label = 'Unnamed', view = '', data = {} } = defaults;
  const node = typeof input === 'string' ? { id: input } : { ...input };

  type M = t.IModuleTreeNode<D>;
  const props = (node.props = node.props || {}) as NonNullable<M['props']>;
  props.kind = 'MODULE';
  props.data = (props.data || data) as D;
  props.view = props.view || view;

  const treeview = (props.treeview = props.treeview || {});
  treeview.label = treeview.label ? treeview.label : label;

  return node as M;
}
