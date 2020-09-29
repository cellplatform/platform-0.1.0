import { model, t } from '../common';

type O = Record<string, unknown>;
type N = t.ITreeviewNode;

/**
 * DSL handlers for manipulating a treeview node.
 */
export const treeHandlers = <P extends O>(module: t.IModule) => {
  type B = t.ITreeviewNodeBuilder<P>;

  const handlers: t.BuilderHandlers<N, B> = {
    parent: (args) => args.builder.parent,

    label(args) {
      args.model.change((draft) => {
        model.treeview(draft).label = (args.params[0] || '').trim();
      });
    },
  };

  return handlers;
};
