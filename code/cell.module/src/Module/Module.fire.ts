import { t } from '../common';
import { register } from './Module.register';
import { request, find } from './Module.get';

type B = t.EventBus<t.ModuleEvent>;
type P = t.IModuleProps;

/**
 * Fire recipes through the event-bus.
 */
export function fire(bus: B): t.IModuleFire {
  return {
    register: (module: t.IModule, parent?: t.NodeIdentifier) => register(bus, module, parent),
    request: <T extends P>(id: string | t.NodeIdentifier) => request<T>(bus, id),
    find: <T extends P>(args?: t.IModuleFindArgs) => find<T>(bus, args),
  };
}
