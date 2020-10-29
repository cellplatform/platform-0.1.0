import { t, Module, Builder, model } from '../common';
import { moduleHandlers } from './handlers.module';

type E = t.ShellEvent;
type P = t.ShellProps;
type N = t.ITreeNode<P>;
type M = t.IShellBuilderModule;
type B = t.IShellBuilder;

/**
 * Root DSL handlers for working with [Shell].
 */
export const handlers = (bus: t.EventBus<E>, shell: t.IModule) => {
  const fire = Module.fire<P>(bus);

  const moduleBuilder = (module: t.IModule, parent: t.BuilderChain<B>) => {
    const model = shell;
    const handlers = moduleHandlers(module);
    return Builder.create<N, M>({ model, handlers, parent });
  };

  const handlers: t.BuilderHandlers<N, t.IShellBuilder> = {
    /**
     * Rename the shell.
     */
    name(args) {
      args.model.change((draft) => {
        model.data(draft).name = (args.params[0] || '').trim();
      });
    },

    /**
     * Add a module to the shell.
     */
    add(args) {
      const module = args.params[0] as t.IModule;

      if (typeof module !== 'object') {
        throw new Error(`A module was not given.`);
      }

      bus.fire({
        type: 'Shell/add',
        payload: {
          shell: shell.id,
          module: module.id,
          parent: Module.Identity.toNodeId(args.params[1]),
        },
      });

      return moduleBuilder(module, args.builder.self);
    },

    /**
     * Retrieves a module builder.
     */
    module(args) {
      const id = Module.Identity.toNodeId(args.params[0]);
      const module = fire.request(id);
      if (!module) {
        const err = `A module with the id '${id}' has not been added to the shell.`;
        throw new Error(err);
      }
      return moduleBuilder(module, args.builder.self);
    },
  };

  return handlers;
};
