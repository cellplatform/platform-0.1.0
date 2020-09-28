import { t, Module, constants, Builder } from '../common';
import { IShellBuilderModule } from '../types';

type N = t.ITreeNode<t.ShellProps>;

/**
 * An API builder for the [Shell] module.
 */
export function builder(bus: t.EventBus, options: { shell?: t.IModule } = {}) {
  // Retrieve the [ShellModule].
  let shell = options.shell as t.IModule;
  if (!shell) {
    const fire = Module.fire(bus);
    const res = fire.find({ kind: constants.KIND });
    shell = res[0];
  }
  if (!shell) {
    const err = `Cannot create builder. A module of kind '${constants.KIND}' could not be found.`;
    throw new Error(err);
  }

  // Construct the builder API.
  const api = Builder.chain<N, t.IShellBuilder>({
    model: shell,
    handlers: rootHandlers,
  });

  // Finish up.
  return api;
}

/**
 * API method handlers.
 */
const rootHandlers: t.BuilderHandlers<N, t.IShellBuilder> = {
  name(args) {
    args.model.change((draft) => {
      const props = draft.props || (draft.props = {});
      const data = props.data || (props.data = { name: '' });
      data.name = (args.params[0] || '').trim();
    });
  },

  module: {
    kind: 'list:byIndex',
    path: '$.modules',
    builder: (args) => args.create<N, IShellBuilderModule>(moduleHandlers),
  },
};

const moduleHandlers: t.BuilderHandlers<N, t.IShellBuilderModule> = {};
