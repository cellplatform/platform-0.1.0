import { t } from '../common';
import { modules } from './handlers.modules';

type E = t.ShellEvent;
type M = t.ITreeNode<t.ShellProps>;

/**
 * Root DSL handlers for working with [Shell].
 */
export const root = (
  bus: t.EventBus<E>,
  shell: t.IModule,
): t.BuilderHandlers<M, t.IShellBuilder> => {
  return {
    name(args) {
      args.model.change((draft) => {
        const props = draft.props || (draft.props = {});
        const data = props.data || (props.data = { name: '' });
        data.name = (args.params[0] || '').trim();
      });
    },

    modules: {
      kind: 'object',
      path: '$.modules',
      builder: (args) => args.create<M, t.IShellBuilderModules>(modules(bus, shell)),
    },
  };
};
