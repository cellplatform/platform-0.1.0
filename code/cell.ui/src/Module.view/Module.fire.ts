import { Module } from '@platform/cell.module';
import { is } from '@platform/state/lib/common/is';
import { TreeQuery } from '@platform/state/lib/TreeQuery';

import { t } from '../common';

type B = t.EventBus<t.ViewModuleEvent>;
type P = t.IViewModuleProps;

/**
 * Fire recipes through the event-bus.
 */
export function fire<T extends P>(bus: B): t.IViewModuleFire<T> {
  return {
    ...Module.fire<T>(bus),
    render: (args: t.ModuleFireRenderArgs<T>) => render(bus, args),
    selection: (args: t.ModuleFireSelectionArgs) => selection(bus, args),
  };
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
    console.log('-------------------------------------------');
    console.log('el', el, view);
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
