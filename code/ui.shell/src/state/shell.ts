import { merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DEFAULT, props, t } from '../common';

const SHELL = DEFAULT.STATE.SHELL;

export function create() {
  const tree = props.observable<t.IShellTreeState>(SHELL.tree);
  const body = props.observable<t.IShellBodyState>(SHELL.body);
  const sidebar = props.observable<t.IShellSidebarState>(SHELL.sidebar);
  const footer = props.observable<t.IShellFooterState>(SHELL.footer);

  const toChanged = (
    field: t.IShellStateChanged['field'],
    ob: Observable<t.IPropChanged>,
  ): Observable<t.IShellStateChanged> => ob.pipe(map(e => ({ ...e, field })));

  const changed$ = merge(
    toChanged('tree', tree.changed$),
    toChanged('body', body.changed$),
    toChanged('sidebar', sidebar.changed$),
  );

  const model: t.IShellState = {
    changed$,
    tree,
    body,
    sidebar,
    footer,
  };
  return model;
}
