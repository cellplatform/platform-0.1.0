import { TreeQuery } from '@platform/state/lib/TreeQuery';
import { filter, takeUntil, take } from 'rxjs/operators';
import { is } from '@platform/state/lib/common/is';

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
    render: (args: t.ModuleFireRenderArgs<T>) => render(bus, args),
    selection: (args: t.ModuleFireSelectionArgs) => selection(bus, args),
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

/**
 * Fires a render request seqeunce.
 */
export function render<T extends P>(
  bus: B,
  args: t.ModuleFireRenderArgs<T>,
): t.ModuleFireRenderResponse {
  const { selected, data = {} } = args;
  const view = args.view as NonNullable<T['view']>;
  const module = typeof args.module === 'string' ? args.module : args.module.id;

  let el: t.ModuleFireRenderResponse;
  if (!view) {
    return el;
  }

  const payload: t.IModuleRender<T> = {
    module,
    selected,
    data,
    view,
    render(input) {
      el = input;
      payload.handled = true;
    },
    handled: false,
  };

  bus.fire({
    type: 'Module/ui/render',
    payload,
  });

  if (el !== undefined) {
    bus.fire({
      type: 'Module/ui/rendered',
      payload: { module, view, el },
    });
  } else if (args.notFound) {
    // View not rendered by any listeners.
    // If a fallback was given request that to be rendered instead.
    el = render<T>(bus, { module, selected, data, view: args.notFound }); // <== RECURSION 🌳
  }

  return el;
}

/**
 * Fire a tree-selection changed event.
 */
export function selection<T extends P>(bus: B, args: t.ModuleFireSelectionArgs) {
  const { selected } = args;

  type N = t.IModuleNode<any>;
  const root = is.stateObject(args.root) ? (args.root as t.IModule).root : (args.root as N);
  const query = TreeQuery.create<N>({ root });
  const node = selected ? query.findById(selected) : undefined;

  if (selected && !node) {
    const err = `Selection event for [${selected}] cannot be fired because the node does not exist in tree.`;
    throw new Error(err);
  }

  const module = node && selected !== root.id ? findModuleAncestor(query, node) : undefined;

  /**
   * Fire event.
   */
  const selection: t.IModuleSelectionTree | undefined = !node
    ? undefined
    : { id: node.id, props: node.props?.treeview || {} };

  const payload: t.IModuleSelection<T> = {
    module: module?.id || root.id,
    selection: selection,
    view: node?.props?.view || module?.props.view || '',
    data: node?.props?.data || module?.props.data || {},
  };
  bus.fire({ type: 'Module/ui/selection', payload });
}

/**
 * [Helpers]
 */

const findModuleAncestor = (query: t.ITreeQuery, startAt: t.ITreeNode<any>) => {
  return query.ancestor(startAt, (e) => {
    const props = (e.node.props || {}) as t.IModuleProps;
    return props.kind === 'MODULE';
  }) as t.IModuleNode<any> | undefined;
};
