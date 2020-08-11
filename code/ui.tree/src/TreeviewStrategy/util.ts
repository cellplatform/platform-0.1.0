import { TreeQuery } from '@platform/state/lib/TreeQuery';

import { dispose } from '@platform/types';
import { takeUntil } from 'rxjs/operators';

import { t } from '../common';
import { TreeEvents } from '../TreeEvents';
import { mutations } from './mutations';

export { dispose };

type N = t.ITreeviewNode;
type C = t.ITreeviewStrategyContext;

/**
 * Wrangle input args for a strategy.
 */

export const args = (args: t.TreeviewStrategyArgs) => {
  const ctx = args.ctx;
  const disposable = dispose.create(args.until$);
  const event$ = args.event$.pipe(takeUntil(disposable.dispose$));
  const events = TreeEvents.create(event$, disposable.dispose$);
  const mutate = mutations(args.ctx.tree);
  const until$ = disposable.dispose$;
  return { disposable, ctx, event$, events, mutate, until$ };
};

/**
 * Query helpers.
 */
export function get(ctx: C) {
  const query = TreeQuery.create({ root: ctx.tree.root });
  const get = {
    query,
    get root() {
      return ctx.tree.root as N;
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
