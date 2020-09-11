import { TreeState } from '@platform/state';
import { takeUntil } from 'rxjs/operators';

import { t } from '../common';
import * as get from './Module.get';
import * as register from './Module.register';

type P = t.IModuleProps;
type E = t.ModuleEvent;

/**
 * Create a new module
 */
export function create<T extends P>(args: t.ModuleArgs<T>): t.IModule<T> {
  const { bus } = args;
  const root = formatModuleNode<T>(args.root || 'module', { data: args.data });

  // Create the tree-node module.
  const module = TreeState.create({ root }) as t.IModule<T>;

  // Manage events around this module.
  monitorAndDispatch(bus, module);
  get.listen(bus, module);
  register.listen(bus, module);

  // Finish up.
  return module;
}

/**
 * [Helpers]
 */

/**
 * Prepare a tree-node to represent the root of a MODULE.
 */
function formatModuleNode<T extends P = any>(
  input: t.ITreeNode | string,
  defaults: { data?: T['data']; id?: string } = {},
) {
  let node = typeof input === 'string' ? { id: input } : { ...input };

  if (!(node.id || '').trim()) {
    node = { ...node, id: 'module' };
  }

  type M = t.IModuleNode<T>;
  const props = (node.props = node.props || {}) as NonNullable<M['props']>;

  props.kind = 'Module';
  props.data = (props.data || defaults.data) as T;

  return node as M;
}

/**
 * Monitors the events of a module and bubbling
 * relevant events when matched.
 */
function monitorAndDispatch<T extends P>(bus: t.EventBus<E>, module: t.IModule<T>) {
  const until$ = module.dispose$;
  const id = module.id;
  const objChanged$ = module.event.changed$.pipe(takeUntil(until$));
  const objPatched$ = module.event.patched$.pipe(takeUntil(until$));

  objChanged$.subscribe((change) => {
    bus.fire({
      type: 'Module/changed',
      payload: { module: id, change },
    });
  });

  objPatched$.subscribe((patch) => {
    bus.fire({
      type: 'Module/patched',
      payload: { module: id, patch },
    });
  });

  // Finish up.
  return module;
}
