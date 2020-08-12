import { TreeQuery } from '@platform/state/lib/TreeQuery';

import { t } from '../common';

type N = t.ITreeNode;
type F = t.FireEvent<t.ModuleEvent>;

/**
 * Fire recipes through the event-bus.
 */
export function fire(fire: t.FireEvent<t.ModuleEvent>): t.IModuleFire {
  return {
    render: (args: t.ModuleFireRenderArgs) => render(fire, args),
    selection: (args: t.ModuleFireSelectionArgs) => selection(fire, args),
    request: <M extends t.IModule = t.IModule>(id: string) => request<M>(fire, id),
  };
}

/**
 * Fires a render request seqeunce.
 */
export function render(fire: F, args: t.ModuleFireRenderArgs) {
  const { module, tree, data = {}, view = '' } = args;

  let el: JSX.Element | null | undefined = undefined;

  type R = t.IModuleRender;
  const render: R['render'] = (input) => {
    el = input;
    payload.handled = true;
  };
  const payload: R = { module, tree, data, view, render, handled: false };

  fire({
    type: 'Module/render',
    payload,
  });

  if (el !== undefined) {
    fire({
      type: 'Module/rendered',
      payload: { module, el },
    });
  }

  return el;
}

/**
 * Fire a tree-selection changed event.
 */
export function selection(fire: F, args: t.ModuleFireSelectionArgs) {
  const { selected, current } = args;

  type N = t.IModuleNode<any>;
  const root = args.root as N;
  const query = TreeQuery.create<N>({ root });

  const node = selected ? query.findById(selected) : undefined;
  const selection: t.IModuleTreeSelection | undefined = !node
    ? undefined
    : { id: node.id, props: node.props?.treeview || {} };

  const findModule = (startAt: t.ITreeNode<any>) => {
    return query.ancestor(startAt, (e) => {
      const props = (e.node.props || {}) as t.IModuleNodeProps;
      return props.kind === 'MODULE';
    }) as t.IModuleNode<any> | undefined;
  };

  const module = !node ? undefined : findModule(node);

  if (module) {
    const payload: t.IModuleSelection = {
      module: module.id,
      tree: { current, selection },
      view: module?.props?.view,
      data: module?.props?.data,
    };

    fire({
      type: 'Module/selection',
      payload,
    });
  }
}

/**
 * Request a module via an event.
 */
export function request<M extends t.IModule = t.IModule>(
  fire: F,
  id: string,
): t.ModuleRequestResponse<M> {
  let module: M | undefined;
  let path = '';
  fire({
    type: 'Module/request',
    payload: {
      module: id,
      response: (args) => {
        module = args.module as M;
        path = args.path;
      },
    },
  });
  return { path, module };
}
