import { TreeQuery } from '@platform/state/lib/TreeQuery';
import { dispose } from '@platform/types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { t } from '../common';
import { TreeEvents } from '../TreeEvents';
import { mutations } from './mutations';

export { dispose };

type N = t.ITreeviewNode;

/**
 * Wrangle input args for a strategy.
 */
export const args = (args: t.TreeviewStrategyArgs) => {
  const disposable = dispose.create(args.until$);
  const until$ = disposable.dispose$;

  const tree = args.tree;
  const mutate = mutations(tree);

  const treeview$ = new Subject<t.TreeviewEvent>();
  if (args.treeview$) {
    args.treeview$.pipe(takeUntil(until$)).subscribe((e) => treeview$.next(e));
  }

  const events = TreeEvents.create(treeview$, until$);
  const strategy: t.ITreeviewStrategy = disposable;
  return { strategy, tree, treeview$, events, mutate, until$ };
};

/**
 * Query helpers.
 */
export function get(tree: t.ITreeState) {
  const query = TreeQuery.create({ root: tree.root });
  const get = {
    query,
    get root() {
      return tree.root as N;
    },
    get nav() {
      return get.root.props?.treeview?.nav || {};
    },
    get selected() {
      return get.nav.selected;
    },
    get current() {
      return get.nav.current;
    },
    node(id?: t.NodeIdentifier) {
      return id ? query.findById(id) : get.root;
    },
    children(parent?: t.NodeIdentifier) {
      return get.node(parent)?.children || [];
    },
  };
  return get;
}
