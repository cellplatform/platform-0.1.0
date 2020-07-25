import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { t } from '../../common';
import { TreeEvents } from '../../TreeEvents';
import { TreeQuery } from '../../TreeQuery';

export function listen(args: {
  ctrl: t.ITreeViewNavigationCtrl;
  treeview$: Observable<t.TreeViewEvent>;
}) {
  const { ctrl } = args;
  const events = TreeEvents.create(args.treeview$, ctrl.dispose$);
  const patch = ctrl.patch;

  const query = () => TreeQuery.create(ctrl.root);
  const getParent = (node: t.NodeIdentifier) =>
    query().ancestor(node, (e) => e.level > 0 && !e.node.props?.inline);
  const getParentId = (node: t.NodeIdentifier) => {
    const parent = getParent(node);
    return parent ? parent.id : undefined;
  };

  /**
   * Left mouse button handlers.
   */
  const left = events.mouse({ button: ['LEFT'] });

  left.down.node$.subscribe((e) => patch({ selected: e.id }));
  left.down.parent$.subscribe((e) => patch({ current: getParentId(e.node) }));

  left.down.drillIn$.subscribe((e) => patch({ current: e.id }));
  left.down.twisty$
    .pipe(
      filter((e) => Boolean((e.props || {}).inline)),
      filter((e) => (e.children || []).length > 0),
    )
    .subscribe((e) => {
      console.log('open twisty');
      // patch({ current: e.id });
    });
  left.dblclick.node$
    .pipe(
      filter((e) => !(e.props || {}).inline),
      filter((e) => (e.children || []).length > 0),
    )
    .subscribe((e) => patch({ current: e.id }));
}
