import { TreeState } from '@platform/state';
import { wildcard } from '@platform/util.string/lib/wildcard';
import { rx } from '@platform/util.value';
import { filter, takeUntil } from 'rxjs/operators';

import { t } from '../common';
import { isModuleEvent } from './Module.events';
import { fire } from './Module.fire';

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
  defaults: { data?: T['data'] } = {},
) {
  const { data = {} } = defaults;
  const node = typeof input === 'string' ? { id: input } : { ...input };

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
    module.dispatch({
      type: 'Module/changed',
      payload: { module: id, change },
    });
  });

  objPatched$.subscribe((patch) => {
    module.dispatch({
      type: 'Module/patched',
      payload: { module: id, patch },
    });
  });

  // Finish up.
  return module;
}
