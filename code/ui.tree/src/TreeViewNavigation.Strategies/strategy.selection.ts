import { TreeQuery } from '@platform/state/lib/TreeQuery';
import { filter } from 'rxjs/operators';

import { COLORS, t } from '../common';
import { TreeEvents } from '../TreeEvents';

/**
 * Strategy for changing selectino based on mouse input.
 */
export const selection: t.TreeViewNavigationStrategy = (ctrl) => {
  const events = TreeEvents.create(ctrl.treeview$, ctrl.dispose$);

  type N = t.NodeIdentifier;
  const query = () => TreeQuery.create(ctrl.root);
  const getParent = (node: N) =>
    query().ancestor(node, (e) => e.level > 0 && !e.node.props?.inline);

  const setCurrent = (id?: string) => (ctrl.current = id);

  const setColor = (id?: string, color?: string | number) => {
    ctrl.node(id, (node, ctx) => {
      ctx.props(node, (props) => {
        ctx.props(node, (props) => (props.colors = { ...props.colors, label: color }));
      });
    });
  };

  const setSelected = (id?: string) => {
    setColor(ctrl.selected, undefined);
    setColor(id, COLORS.BLUE);
    ctrl.selected = id;
  };

  const toggleOpen = (id?: string) => {
    ctrl.node(id, (node, ctx) => {
      ctx.props(node, (props) => {
        const isOpen = Boolean(props.inline?.isOpen);
        props.inline = { ...props.inline, isOpen: !isOpen };
      });
    });
  };

  /**
   * Left mouse button handlers.
   */
  const left = events.mouse({ button: ['LEFT'] });

  left.down.node$.subscribe((e) => setSelected(e.id));

  left.down.parent$.subscribe((e) => setCurrent(getParent(e.node)?.id));

  left.down.drillIn$.subscribe((e) => setCurrent(e.id));

  left.down.twisty$
    .pipe(
      filter((e) => Boolean((e.props || {}).inline)),
      filter((e) => (e.children || []).length > 0),
    )
    .subscribe((e) => toggleOpen(e.id));

  const dblClickNodeWithChildren$ = left.dblclick.node$.pipe(
    filter((e) => (e.children || []).length > 0),
  );

  dblClickNodeWithChildren$
    .pipe(filter((e) => !(e.props || {}).inline))
    .subscribe((e) => setCurrent(e.id));

  dblClickNodeWithChildren$
    .pipe(filter((e) => Boolean((e.props || {}).inline)))
    .subscribe((e) => toggleOpen(e.id));
};
