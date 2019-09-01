import { TreeView } from '@platform/ui.tree';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { t } from '../common';

export function init(events$: Observable<t.ShellEvent>, dispose$: Observable<{}>): t.IShellEvents {
  const tree$ = events$.pipe(
    filter(e => e.type.startsWith('TREEVIEW/')),
    map(e => e as t.TreeViewEvent),
  );

  return {
    events$,
    tree: TreeView.events(tree$, dispose$),
    progress: {
      start$: events$.pipe(
        filter(e => e.type === 'SHELL/progress/start'),
        map(e => e.payload as t.IShellProgressStart),
      ),
      complete$: events$.pipe(
        filter(e => e.type === 'SHELL/progress/complete'),
        map(e => e.payload as t.IShellProgressComplete),
      ),
    },
  };
}
