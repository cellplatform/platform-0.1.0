import { TreeQuery } from '@platform/state/lib/TreeQuery';

import { t } from '../common';

/**
 * Manage the event bus.
 */
export function fire(fire: t.FireEvent<t.ModuleEvent>): t.IModuleFire {
  /**
   * Fires a render request seqeunce.
   */
  const render: t.ModuleFireRender = (args) => {
    const { module, tree, data = {}, view = '' } = args;

    let el: JSX.Element | null | undefined = undefined;
    const render: t.IModuleRender['render'] = (input) => (el = input);

    fire({
      type: 'Module/render',
      payload: { module, tree, data, view, render },
    });

    if (el !== undefined) {
      fire({
        type: 'Module/rendered',
        payload: { module, el },
      });
    }

    return el;
  };

  /**
   * Fire a tree-selection changed event.
   */
  const selection: t.ModuleFireSelection = (args) => {
    const { selected, current } = args;

    type N = t.ITreeNodeModule<any>;
    const root = args.root as N;
    const query = TreeQuery.create<N>({ root });

    const node = selected ? query.findById(selected) : undefined;
    const selection: t.IModuleTreeSelection | undefined = !node
      ? undefined
      : { id: node.id, props: node.props?.treeview || {} };

    const findModule = (startAt: t.ITreeNode<any>) => {
      return query.ancestor(startAt, (e) => {
        const props = (e.node.props || {}) as t.ITreeNodeModuleProps;
        return props.kind === 'MODULE';
      }) as t.ITreeNodeModule<any> | undefined;
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
  };

  return { render, selection };
}
