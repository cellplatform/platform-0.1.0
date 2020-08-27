import { t } from '../common';
import { register } from './Module.register';
import { request } from './Module.request';

type B = t.EventBus<t.ModuleEvent>;
type P = t.IModuleProps;

/**
 * Fire recipes through the event-bus.
 */
export function fire<T extends P>(bus: B): t.IModuleFire<T> {
  return {
    register: (module: t.IModule, parent: string) => register(bus, module, parent),
    request: <T extends P>(id: string) => request<T>(bus, id),
  };
}
