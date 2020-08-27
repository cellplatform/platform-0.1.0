import { filter, take, takeUntil } from 'rxjs/operators';
import { rx, t } from '../common';
import { request } from './Module.request';
import { toNodeId } from '@platform/state/lib/common';

type B = t.EventBus<t.ModuleEvent>;

/**
 * Registers a module.
 */
export function register(bus: B, module: t.IModule, parent?: string) {
  const event$ = bus.event$.pipe(takeUntil(module.dispose$));
  const res: t.ModuleRegistration = { ok: false, module };

  const parentResponse = (parent?: string) => {
    res.parent = parent ? request(bus, parent) : undefined;
    res.ok = Boolean(res.parent);
  };

  if (parent) {
    // Listen for the child registration to confirm success.
    rx.payload<t.IModuleChildRegisteredEvent>(event$, 'Module/child/registered')
      .pipe(
        filter((e) => e.child === module.id),
        take(1),
      )
      .subscribe((e) => parentResponse(e.module));
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
 * Registers a child node
 */
export function registerChild(args: {
  bus: t.EventBus<any>;
  parent: t.IModule;
  child: t.IModule;
  within?: t.NodeIdentifier;
}) {
  const { bus, parent, child } = args;

  parent.add({
    root: child,
    parent: args.within ? toNodeId(args.within) : undefined,
  });

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
