import { t, Module } from '../common';

type E = t.ShellEvent;
type M = t.ITreeNode<t.ShellProps>;

/**
 * DSL for registring modules within the [Shell].
 */
export const modules = (
  bus: t.EventBus<E>,
  shell: t.IModule,
): t.BuilderHandlers<M, t.IShellBuilderModules> => {
  return {
    add(args) {
      const module = args.params[0] as t.IModule;

      if (typeof module !== 'object') {
        throw new Error(`A module was not given.`);
      }

      bus.fire({
        type: 'Shell/add',
        payload: { shell: shell.id, module: module.id },
      });
    },
  };
};
