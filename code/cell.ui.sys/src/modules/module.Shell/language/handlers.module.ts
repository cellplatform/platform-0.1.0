import { t, Module, Builder } from '../common';

type E = t.ShellEvent;
type M = t.ITreeNode<t.ShellProps>;

/**
 * Root DSL handlers for working with a registered module within the [Shell].
 */
export const moduleHandlers = (bus: t.EventBus<E>, shell: t.IModule, module: t.IModule) => {
  const handlers: t.BuilderHandlers<M, t.IShellBuilderModule> = {
    shell(args) {
      return args.builder.parent;
    },
  };
  return handlers;
};
