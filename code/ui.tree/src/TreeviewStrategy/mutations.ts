import { t } from '../common';

type M = t.ITreeviewStrategyMutation;
type N = t.ITreeviewNode;
type P = t.ITreeviewNodeProps;

/**
 * Constructs a helper that performs mutations on a treeview.
 */
export function mutations(root: t.ITreeviewState): M {
  const getProps = (node: N) => {
    const props = node.props || (node.props = {});
    const treeview = props.treeview || (props.treeview = {});
    return treeview;
  };

  const getNav = (node: N) => {
    const props = getProps(node);
    const nav = props.nav || (props.nav = {});
    return nav;
  };

  const selected = (id?: string) => {
    root.change((draft) => (getNav(draft).selected = id));
    return mutation;
  };

  const current = (id?: string) => {
    root.change((draft) => (getNav(draft).current = id));
    return mutation;
  };

  const toggleOpen = (id?: string) => {
    root.change((draft, ctx) => {
      const node = ctx.findById(id);
      if (node) {
        const props = getProps(node);
        const inline = props.inline || (props.inline = {});
        const isOpen = Boolean(inline.isOpen);
        inline.isOpen = !isOpen;
      }
    });

    return mutation;
  };

  const mutation: M = { current, selected, toggleOpen };
  return mutation;
}
