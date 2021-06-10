import { filter, takeUntil } from 'rxjs/operators';

import { rx, t, toNodeId, wildcard } from '../common';
import { trimKindPrefix } from './Module.flags';

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
  const { key, namespace, data, kind } = args;
  const res: t.IModule<T>[] = [];

  const payload: t.IModuleFind = {
    module: (args.module || '').trim() || WILDCARD,
    key,
    namespace,
    kind,
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
  const $ = bus.$.pipe(takeUntil(module.dispose$));

  type A = t.IModuleFindArgs;
  type D = NonNullable<A['data']>;

  const isFieldMatch = (data: Record<string, unknown>, patterns: D, key: string) => {
    const value = data[key];
    const pattern = patterns[key];
    if (typeof value === 'string' && typeof pattern === 'string') {
      if (!wildcard.isMatch(value, pattern)) {
        return false;
      }
    } else if (value !== pattern) {
      return false;
    }
    return true;
  };

  const allFieldsMatch = (patterns: D) => {
    const keys = Object.keys(patterns);
    const data = module.state.props?.data;
    if (!data) {
      return keys.length === 0;
    }
    return keys.length === 0 ? true : keys.every((key) => isFieldMatch(data, patterns, key));
  };

  const isMatch = (e: A) => {
    if (typeof e.key === 'string' && !wildcard.isMatch(module.key, e.key)) {
      return false;
    }

    if (typeof e.namespace === 'string' && !wildcard.isMatch(module.namespace, e.namespace)) {
      return false;
    }

    if (typeof e.kind === 'string') {
      const kind = trimKindPrefix(module.state.props?.kind);
      const pattern = trimKindPrefix(e.kind);
      if (!wildcard.isMatch(kind, pattern)) {
        return false;
      }
    }

    if (typeof e.data === 'object' && !allFieldsMatch(e.data)) {
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
