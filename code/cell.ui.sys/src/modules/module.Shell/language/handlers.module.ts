import { Builder, t } from '../common';
import { treeHandlers } from './handlers.tree';

type M = t.ITreeNode<t.ShellProps>;
type B = t.IShellBuilderModule;
type T = t.ITreeviewNodeBuilder<B>;

/**
 * DSL handlers for working with a registered module within the [Shell].
 */
export const moduleHandlers = (module: t.IModule) => {
  const handlers: t.BuilderHandlers<M, B> = {
    parent: (args) => args.builder.parent,
    label: (args) => args.builder.self.tree.label(args.params[0]),

    tree: {
      kind: 'object',
      builder(args) {
        const parent = args.builder.parent;
        const model = module;
        const handlers = treeHandlers<B>(model);
        return Builder.create<M, T>({ model, handlers, parent });
      },
    },
  };
  return handlers;
};
