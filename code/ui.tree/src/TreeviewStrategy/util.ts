import { TreeQuery } from '@platform/state/lib/TreeQuery';

import { dispose } from '@platform/types';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { t } from '../common';
import { TreeEvents } from '../TreeEvents';
import { mutations } from './mutations';

export { dispose };

type N = t.ITreeviewNode;
type C = t.ITreeviewStrategyContext;
type D = t.IDisposable;
type E = t.TreeviewEvent;

/**
 * Wrangle input args for a strategy.
 */
export const prepare = (args: {
  ctx: C;
  disposable?: D;
  event$: Observable<E>;
  until$?: Observable<any>;
}) => {
  const api = args.disposable
    ? dispose.until(args.disposable, args.until$)
    : dispose.create(args.until$);
  const event$ = args.event$.pipe(takeUntil(api.dispose$));
  const events = TreeEvents.create(event$, api.dispose$);
  const mutate = mutations(args.ctx.root);
  return { api, event$, events, mutate };
};

/**
 * Query helpers.
 */
export function get(ctx: C) {
  const query = TreeQuery.create({ root: ctx.root.root });
  const get = {
    query,
    get root() {
      return ctx.root.root as N;
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
