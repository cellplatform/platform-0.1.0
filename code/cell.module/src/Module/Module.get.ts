import { filter, takeUntil } from 'rxjs/operators';

import { rx, t, toNodeId, wildcard } from '../common';

type B = t.EventBus<t.ModuleEvent>;
type P = t.IModuleProps;

const WILDCARD = '*';
const isWildcard = (input?: string) => !input || [WILDCARD, ''].includes((input || '').trim());

/**
 * Request a module via an event.
 */
export function request<T extends P = P>(
  bus: B,
  id: string | t.NodeIdentifier,
): t.IModule<T> | undefined {
  let res: t.IModule<T> | undefined;
  let handled = false;

  const payload: t.IModuleRequest = {
    module: toNodeId(id),
    get handled() {
      return handled;
    },
    respond(module) {
      handled = true;
      res = module as t.IModule<T>;
    },
  };

  bus.fire({ type: 'Module/request', payload });
  return res;
}

/**
 * Find a module based on pattern matching.
 */
export function find<T extends P = P>(bus: B, args: t.IModuleFindArgs = {}): t.IModule<T>[] {
  const { key, namespace, data } = args;
  const res: t.IModule<T>[] = [];

  const payload: t.IModuleFind = {
    module: (args.module || '').trim() || WILDCARD,
    key,
    namespace,
    data,
    respond(module) {
      res.push(module as t.IModule<T>);
    },
  };

  bus.fire({ type: 'Module/find', payload });
  return res;
}

/**
 * Listener for "Module/request" and "Module/find" events.
 */
export function listen<T extends P>(bus: B, module: t.IModule<T>) {
  const $ = bus.event$.pipe(takeUntil(module.dispose$));

  type A = t.IModuleFindArgs;

  const isDataMatch = (e: NonNullable<A['data']>) => {
    const data = module.root.props?.data;
    if (!data) {
      return true;
    }
    const keys = Object.keys(e);
    if (keys.length === 0) {
      return true;
    }
    for (const key of keys) {
      const value = data[key];
      const pattern = e[key];
      if (typeof value === 'string' && typeof pattern === 'string') {
        if (!wildcard.isMatch(value, pattern)) {
          return false;
        }
      } else if (value !== pattern) {
        return false;
      }
    }

    return true;
  };

  const isMatch = (e: A) => {
    if (typeof e.key === 'string' && !wildcard.isMatch(module.key, e.key)) {
      return false;
    }

    if (typeof e.namespace === 'string' && !wildcard.isMatch(module.namespace, e.namespace)) {
      return false;
    }

    if (typeof e.data === 'object' && !isDataMatch(e.data)) {
      return false;
    }

    return true;
  };

  const isWithinScope = (e: A) => {
    if (!e.module || isWildcard(e.module)) {
      return true;
    } else {
      const scope = request(bus, e.module);
      return !scope ? false : scope.id === module.id || scope.contains(module);
    }
  };

  rx.payload<t.IModuleRequestEvent>($, 'Module/request')
    .pipe(
      filter((e) => !e.handled),
      filter((e) => module.id === e.module),
    )
    .subscribe((e) => e.respond(module));

  rx.payload<t.IModuleFindEvent>($, 'Module/find')
    .pipe(
      filter((e) => isMatch(e)),
      filter((e) => isWithinScope(e)),
    )
    .subscribe((e) => e.respond(module));
}
