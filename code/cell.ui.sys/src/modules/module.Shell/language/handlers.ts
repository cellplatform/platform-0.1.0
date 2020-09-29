import { t, Module } from '../common';

type E = t.ShellEvent;
type M = t.ITreeNode<t.ShellProps>;

/**
 * Root DSL handlers for working with [Shell].
 */
export const handlers = (
  bus: t.EventBus<E>,
  shell: t.IModule,
): t.BuilderHandlers<M, t.IShellBuilder> => {
  return {
    /**
     * Rename the shell.
     */
    name(args) {
      args.model.change((draft) => {
        const props = draft.props || (draft.props = {});
        const data = props.data || (props.data = { name: '' });
        data.name = (args.params[0] || '').trim();
      });
    },

    // modules: {
    //   kind: 'object',
    //   path: '$.modules',
    //   builder: (args) => args.create<M, t.IShellBuilderModules>(modules(bus, shell)),
    // },

    /**
     * Add a module to the shell.
     */
    add(args) {
      const module = args.params[0] as t.IModule;
      const parent = Module.Identity.toNodeId(args.params[1]);

      if (typeof module !== 'object') {
        throw new Error(`A module was not given.`);
      }

      bus.fire({
        type: 'Shell/add',
        payload: { shell: shell.id, module: module.id, parent },
      });
    },
  };
};
