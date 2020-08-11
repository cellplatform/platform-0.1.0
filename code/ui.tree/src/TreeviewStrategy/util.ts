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
 * Retrieve the parent of the given node.
 */
export const getParent = (ctx: C, node: N) => {
  return ctx.root.query.ancestor(node, (e) => {
    const node = e.node as N;
    return e.level > 0 && !node.props?.treeview?.inline;
  });
};
