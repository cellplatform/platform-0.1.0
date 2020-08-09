import { t, COLORS } from '../common';

type M = t.ITreeviewNavigationMutation;

/**
 * Constructs a helper that performs mutations on a treeview.
 */
export function create(nav: t.ITreeViewNavigation): M {
  const current = (id?: string) => {
    nav.current = id;
    return mutation;
  };

  const color = (id?: string, color?: string | number) => {
    nav.node(id, (node, ctx) => {
      ctx.props(node, (props) => {
        ctx.props(node, (props) => (props.colors = { ...props.colors, label: color }));
      });
    });
    return mutation;
  };

  const selected = (id?: string) => {
    color(nav.selected, undefined);
    color(id, COLORS.BLUE);
    nav.selected = id;
    return mutation;
  };

  const toggleOpen = (id?: string) => {
    nav.node(id, (node, ctx) => {
      ctx.props(node, (props) => {
        const isOpen = Boolean(props.inline?.isOpen);
        props.inline = { ...props.inline, isOpen: !isOpen };
      });
    });
    return mutation;
  };

  const mutation: M = { current, color, selected, toggleOpen };
  return mutation;
}
