import { filter, take, takeUntil } from 'rxjs/operators';
import { rx, t } from '../common';

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

/**
 * Registers a module.
 */
export function register(bus: B, module: t.IModule, parent?: string) {
  const event$ = bus.event$.pipe(takeUntil(module.dispose$));
  const res: t.ModuleRegistration = { ok: false, module };

  const parentResponse = (id?: string) => {
    res.parent = request(bus, id || '').module;
    res.ok = Boolean(res.parent);
  };

  if (parent) {
    // Listen for the child registration to confirm success.
    rx.payload<t.IModuleChildRegisteredEvent>(event$, 'Module/child/registered')
      .pipe(
        filter((e) => e.child === module.id),
        take(1),
      )
      .subscribe((e) => parentResponse(parent));
  } else {
    // No target parent was specified (wildcard registration)
    // Listen for whether any other listeners catch the registration and route it into a module.
    rx.payload<t.IModuleRegisterEvent>(event$, 'Module/register')
      .pipe(
        filter((e) => e.module === module.id),
        filter((e) => Boolean(e.parent)),
        take(1),
      )
      .subscribe((e) => parentResponse(e.parent));
  }

  // Fire out the registration request.
  bus.fire({ type: 'Module/register', payload: { module: module.id, parent } });

  // Finish up.
  if (res.ok && typeof parent === 'string') {
    bus.fire({
      type: 'Module/registered',
      payload: { module: module.id, parent },
    });
  }
  return res;
}

/**
 * Request a module via an event.
 */
export function request<T extends P = P>(bus: B, id: string): t.ModuleRequestResponse<T> {
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
  return { module };
}
