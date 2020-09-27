import { t, Module, constants, Builder } from '../common';

type N = t.ITreeNode<t.ShellProps>;

/**
 * An API builder for the [Shell] module.
 */
export function builder(bus: t.EventBus, options: { shell?: t.IModule } = {}) {
  // Retrieve the [ShellModule].
  let module = options.shell as t.IModule;
  if (!module) {
    const fire = Module.fire(bus);
    const res = fire.find({ kind: constants.KIND });
    module = res[0];
  }
  if (!module) {
    const err = `Cannot create builder. A module of kind '${constants.KIND}' could not be found.`;
    throw new Error(err);
  }

  // Construct the builder API.
  const change = module.change;
  const builder = Builder.chain<N, t.IShellBuilder>({
    state: () => module.state,
    change,
    handlers: rootHandlers,
  });

  console.log('shell (module):', module.id);

  // Finish up.
  return builder;
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
    kind: 'list:byName',
    path: '$.modules',
    handlers: () => moduleHandlers,
    default: () => ({}),
  },
};

const moduleHandlers: t.BuilderHandlers<N, t.IShellBuilderModule> = {};
