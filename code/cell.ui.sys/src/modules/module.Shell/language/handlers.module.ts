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
    tree(args) {
      const parent = args.builder.self;
      const model = module;
      const handlers = treeHandlers<B>(module);
      return Builder.create<M, T>({ model, handlers, parent });
    },
  };
  return handlers;
};
