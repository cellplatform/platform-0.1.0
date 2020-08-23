import { TreeState } from '@platform/state';
import { rx } from '@platform/util.value';
import { filter } from 'rxjs/operators';

import { t } from '../common';
import * as events from './Module.events';
import { fire } from './Module.fire';
import { wildcard } from '@platform/util.string/lib/wildcard';

type P = t.IModuleProps;

/**
 * Create a new module
 */
export function create<T extends P>(args: t.ModuleArgs<T>): t.IModule<T> {
  const { bus } = args;

  const root = formatModuleNode<T>(args.root || 'module', {
    treeview: args.treeview,
    view: args.view,
    data: args.data,
  });

  // Create the tree-node module.
  const module = TreeState.create({ root }) as t.IModule<T>;
  events.monitorAndDispatch(bus, module);

  // Listen for request events, and lookup to see if
  // the module can be resolved within the child set.
  rx.payload<t.IModuleRequestEvent>(bus.event$, 'Module/request')
    .pipe(
      filter((e) => !e.handled),
      filter((e) => wildcard.isMatch(module.id, e.module)),
    )
    .subscribe((e) => e.respond({ module }));

  /**
   * Catch requests from children to register within this module.
   */
  rx.payload<t.IModuleRegisterEvent>(bus.event$, 'Module/register')
    .pipe(
      filter((e) => e.module !== module.id),
      filter((e) => e.parent === module.id),
    )
    .subscribe((e) => {
      const parent = module as t.IModule;
      const child = fire(bus).request(e.module).module;
      if (child) {
        registerChild({ bus, parent, child });
      }
    });

  // Finish up.
  return module;
}

/**
 * [Helpers]
 */

function registerChild(args: { bus: t.EventBus<any>; parent: t.IModule; child: t.IModule }) {
  const { bus, parent, child } = args;
  parent.add(child);

  bus.fire({
    type: 'Module/child/registered',
    payload: { module: parent.id, child: child.id },
  });

  // Alert listeners when disposed.
  child.dispose$.subscribe((e) => {
    bus.fire({
      type: 'Module/child/disposed',
      payload: { module: parent.id, child: child.id },
    });
  });
}

/**
 * Prepare a tree-node to represent the root of a MODULE.
 */
function formatModuleNode<T extends P = any>(
  input: t.ITreeNode | string,
  defaults: { treeview?: string | t.ITreeviewNodeProps; view?: T['view']; data?: T['data'] } = {},
) {
  const { view = '', data = {} } = defaults;
  const node = typeof input === 'string' ? { id: input } : { ...input };

  type M = t.IModuleNode<T>;
  const props = (node.props = node.props || {}) as NonNullable<M['props']>;

  props.kind = 'MODULE';
  props.data = (props.data || data) as T;
  props.view = props.view || view;

  if (typeof defaults.treeview === 'object') {
    props.treeview = props.treeview || defaults.treeview;
  } else {
    const treeview = (props.treeview = props.treeview || {});
    treeview.label = treeview.label ? treeview.label : defaults.treeview || 'Unnamed';
  }

  return node as M;
}
