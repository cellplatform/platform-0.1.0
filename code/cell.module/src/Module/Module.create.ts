import { TreeState } from '@platform/state';
import { wildcard } from '@platform/util.string/lib/wildcard';
import { rx } from '@platform/util.value';
import { filter, takeUntil } from 'rxjs/operators';

import { t } from '../common';
import { isModuleEvent } from './Module.events';
import { fire } from './Module.fire';
import { registerChild } from './Module.register';

type P = t.IModuleProps;

/**
 * Create a new module
 */
export function create<T extends P>(args: t.ModuleArgs<T>): t.IModule<T> {
  const { bus } = args;
  const root = formatModuleNode<T>(args.root || 'module', { data: args.data });

  // Create the tree-node module.
  const module = TreeState.create({ root }) as t.IModule<T>;
  monitorAndDispatch(bus, module);

  /**
   * Listen for request events, and lookup to see if
   * the module can be resolved within the child set.
   */
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
      filter((e) => e.module !== module.id && Boolean(e.parent)),
      filter((e) => e.parent === module.id || Boolean(module.query.findById(e.parent))),
    )
    .subscribe((e) => {
      const parent = module as t.IModule;
      const child = fire(bus).request(e.module);
      if (child) {
        const within = e.parent === module.id ? undefined : e.parent;
        registerChild({ bus, parent, child, within });
      }
    });

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
  const { data = {} } = defaults;
  let node = typeof input === 'string' ? { id: input } : { ...input };

  if (!(node.id || '').trim()) {
    node = { ...node, id: 'module' };
  }

  type M = t.IModuleNode<T>;
  const props = (node.props = node.props || {}) as NonNullable<M['props']>;

  props.kind = 'MODULE';
  props.data = (props.data || data) as T;

  return node as M;
}

/**
 * Monitors the events of a module and bubbling
 * relevant events when matched.
 */
function monitorAndDispatch<T extends P>(bus: t.EventBus<t.ModuleEvent>, module: t.IModule<T>) {
  const until$ = module.dispose$;
  const event$ = bus.event$.pipe(takeUntil(until$));

  /**
   * Bubble module events through the StateObject's internal dispatch.
   */
  event$
    .pipe(
      filter((e) => isModuleEvent(e)),
      filter((e) => e.payload.module === module.id),
    )
    .subscribe((e) => module.dispatch(e));

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
