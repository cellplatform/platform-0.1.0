import { t, toNodeId } from '../common';

type B = t.EventBus<t.ModuleEvent>;
type P = t.IModuleProps;

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
