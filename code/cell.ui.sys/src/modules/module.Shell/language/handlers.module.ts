import { Builder, t } from '../common';

type M = t.ITreeNode<t.ShellProps>;
type B = t.IShellBuilderModule;

/**
 * DSL handlers for working with a registered module within the [Shell].
 */
export const moduleHandlers = (module: t.IModule) => {
  const handlers: t.BuilderHandlers<M, B> = {
    parent: (args) => args.builder.parent,
    label: (args) => args.builder.self.tree.label(args.params[0]),

    tree: {
      kind: 'object',
      builder: (args) => Builder.tree.node(module, args.builder.parent),
    },
  };
  return handlers;
};
