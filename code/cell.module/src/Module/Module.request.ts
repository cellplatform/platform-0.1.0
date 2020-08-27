import { t } from '../common';

type B = t.EventBus<t.ModuleEvent>;
type P = t.IModuleProps;


/**
 * Request a module via an event.
 */
export function request<T extends P = P>(bus: B, id: string): t.IModule<T> | undefined {
  let module: t.IModule<T> | undefined;
  let handled = false;
  bus.fire({
    type: 'Module/request',
    payload: {
      module: id,
      get handled() {
        return handled;
      },
      respond: (args) => {
        handled = true;
        module = args.module as t.IModule<T>;
      },
    },
  });
  return module;
}
