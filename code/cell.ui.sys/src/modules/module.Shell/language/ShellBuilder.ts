import { t, Module, constants, Builder } from '../common';
import { root } from './handlers.root';

type E = t.ShellEvent;
type M = t.ITreeNode<t.ShellProps>;

/**
 * An API builder for the [Shell] module.
 */
export function builder(bus: t.EventBus, options: { shell?: t.IModule } = {}) {
  // Retrieve the [ShellModule].
  let shell = options.shell as t.IModule;
  if (!shell) {
    const res = Module.fire(bus).find({ kind: constants.KIND });
    shell = res[0];
  }
  if (!shell) {
    const err = `Cannot create builder. A module of kind '${constants.KIND}' could not be found.`;
    throw new Error(err);
  }

  // Construct the builder API.
  const api = Builder.chain<M, t.IShellBuilder>({
    model: shell,
    handlers: root(bus.type<E>(), shell),
  });

  // Finish up.
  return api;
}
