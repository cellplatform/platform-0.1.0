import { TreeQuery } from '@platform/state/lib/TreeQuery';
import { filter, takeUntil, take } from 'rxjs/operators';
import { is } from '@platform/state/lib/common/is';

import { rx, t } from '../common';

type B = t.EventBus<t.ModuleEvent>;
type P = t.IModuleProps;

/**
 * Fire recipes through the event-bus.
 */
export function fire(bus: B): t.IModuleFire {
  return {
    register: (module: t.IModule, parent: string) => register(bus, module, parent),
    render: (args: t.ModuleFireRenderArgs) => render(bus, args),
    selection: (args: t.ModuleFireSelectionArgs) => selection(bus, args),
    request: <T extends P>(id: string) => request<T>(bus, id),
  };
}

/**
 * Registers a module.
 */
export function register(bus: B, module: t.IModule, parent: string) {
  const event$ = bus.event$.pipe(takeUntil(module.dispose$));
  const res: t.ModuleRegistration = { ok: false, module };

  // Listen for the child registration to confirm success.
  rx.payload<t.IModuleChildRegisteredEvent>(event$, 'Module/child/registered')
    .pipe(
      filter((e) => e.child === module.id),
      take(1),
    )
    .subscribe((e) => {
      res.parent = request(bus, parent).module;
      res.ok = Boolean(res.parent);
    });

  // Fire out the registration request.
  bus.fire({ type: 'Module/register', payload: { module: module.id, parent } });

  // Finish up.
  if (res.ok) {
    bus.fire({ type: 'Module/registered', payload: { module: module.id, parent } });
  }
  return res;
}

/**
 * Fires a render request seqeunce.
 */
export function render(bus: B, args: t.ModuleFireRenderArgs) {
  const { module, tree, data = {}, view = '' } = args;

  let el: JSX.Element | null | undefined = undefined;

  type R = t.IModuleRender;
  const render: R['render'] = (input) => {
    el = input;
    payload.handled = true;
  };
  const payload: R = { module, tree, data, view, render, handled: false };

  bus.fire({
    type: 'Module/render',
    payload,
  });

  if (el !== undefined) {
    bus.fire({
      type: 'Module/rendered',
      payload: { module, el },
    });
  }

  return el;
}

/**
 * Fire a tree-selection changed event.
 */
export function selection(bus: B, args: t.ModuleFireSelectionArgs) {
  const { selected, current } = args;

  type N = t.IModuleNode<any>;
  const root = is.stateObject(args.root) ? (args.root as t.IModule).root : (args.root as N);
  const query = TreeQuery.create<N>({ root });

  const node = selected ? query.findById(selected) : undefined;
  const selection: t.IModuleSelectionTree | undefined = !node
    ? undefined
    : { id: node.id, props: node.props?.treeview || {} };

  const findModule = (startAt: t.ITreeNode<any>) => {
    return query.ancestor(startAt, (e) => {
      const props = (e.node.props || {}) as t.IModuleProps;
      return props.kind === 'MODULE';
    }) as t.IModuleNode<any> | undefined;
  };

  const module = !node ? undefined : findModule(node);
  const payload: t.IModuleSelection = {
    module: root.id,
    tree: { current, selection },
    view: module?.props?.view,
    data: module?.props?.data,
  };
  bus.fire({ type: 'Module/selection', payload });
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
