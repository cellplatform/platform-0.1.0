import { Module, t } from '../common';

type B = t.EventBus;
type P = t.HarnessProps;

/**
 * Helpers for immutably changing the module state.
 */
export function changer<D extends t.HarnessData>(args: {
  index: number;
  module: t.HarnessModule;
  root: t.NodeIdentifier;
}) {
  const { module, index } = args;

  const methods = {
    props: (fn: (props: P) => void) => {
      module.change((draft, ctx) => {
        const root = ctx.findById(args.root);
        if (root) {
          const children = root.children || (root.children = []);
          const node = children[index] || { id: Module.Identity.slug() };
          const props = node.props || (node.props = {});
          fn(props);
          children[index] = node;
        }
      });
    },

    data: (fn: (data: D) => void) => {
      methods.props((props) => {
        const data = props.data || (props.data = {} as any);
        fn(data as D);
      });
    },

    treeview: (fn: (props: t.ITreeviewNodeProps) => void) => {
      methods.props((props) => fn(props.treeview || (props.treeview = {})));
    },
  };

  return methods;
}
