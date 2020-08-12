import { t } from '../common';

type M = t.ITreeviewStrategyMutation;
type N = t.ITreeviewNode;

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

  const getInline = (node: N) => {
    const props = getProps(node);
    const inline = props.inline || (props.inline = {});
    return inline;
  };

  const selected = (id?: string) => {
    root.change((draft) => (getNav(draft).selected = id));
    return mutation;
  };

  const current = (id?: string) => {
    root.change((draft) => (getNav(draft).current = id));
    return mutation;
  };

  const toggleOpen = (id?: string, isOpen?: boolean) => {
    root.change((draft, ctx) => {
      const node = ctx.query(draft).findById(id);
      if (node) {
        const inline = getInline(node);
        inline.isOpen = isOpen === undefined ? !Boolean(inline.isOpen) : isOpen;
      }
    });

    return mutation;
  };
  const open = (id?: string) => toggleOpen(id, true);
  const close = (id?: string) => toggleOpen(id, false);

  const mutation: M = { current, selected, toggleOpen, open, close };
  return mutation;
}
