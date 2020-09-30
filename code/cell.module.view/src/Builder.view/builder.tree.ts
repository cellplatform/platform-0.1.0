import { t } from '../common';
import { Builder } from '@platform/cell.module';

type O = Record<string, unknown>;
type M = t.ITreeviewNode;

/**
 * Builder tools for a TreeView.
 * Generics:
 *    <M> model
 *    <P> parent builder
 */
export const tree: t.ViewBuilderTree = {
  node<P extends O>(model: t.BuilderModel<any>, parent?: t.BuilderChain<any>) {
    type A = t.ViewBuilderTreeNode<P>;
    const handlers = treeHandlers<P>();
    return Builder.create<M, A>({ model, handlers, parent });
  },
};

/**
 * Builder handlers for manipulating a treeview node.
 */
export const treeHandlers = <P extends O>() => {
  type A = t.ViewBuilderTreeNode<P>;

  const handlers: t.BuilderHandlers<M, A> = {
    parent: (args) => args.builder.parent,

    label(args) {
      args.model.change((draft) => {
        model(draft).treeview.label = (args.params[0] || '').trim();
      });
    },
  };

  return handlers;
};

/**
 * [Helpers]
 */

function model(state: M) {
  const res = {
    get props() {
      return state.props || (state.props = {});
    },
    get treeview() {
      const props = res.props;
      return props.treeview || (props.treeview = {});
    },
  };
  return res;
}
