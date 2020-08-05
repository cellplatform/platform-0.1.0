import { TreeState } from '@platform/state';
import { Subject, Observable } from 'rxjs';
import { share } from 'rxjs/operators';

import { t } from '../common';
import { create as createEvents } from './Module.events';

type O = Record<string, unknown>;
type Node = t.ITreeNode;
type Event = t.Event<O>;

/**
 * Subscribe to changes on a particular module.
 */
export function subscribe<T extends Node = Node, A extends Event = any>(args: {
  event$: Observable<t.Event>;
  tree?: t.ITreeState<T, A>;
  filter?: t.ModuleFilter;
  until$?: Observable<any>;
}): t.ModuleSubscription<T, A> {
  const dispose$ = new Subject<void>();
  const dispose = () => dispose$.next();
  if (args.until$) {
    args.until$.subscribe(() => dispose());
  }

  const tree = args.tree || TreeState.create({ dispose$ });

  let events = createEvents(args.event$, args.until$);
  events = args.filter ? events.filter(args.filter) : events;

  events.changed$.subscribe((e) => {
    tree.change((draft, ctx) => {
      const to = e.change.to;
      draft.props = to.props;
      draft.children = to.children;
    });
  });

  return {
    get isDisposed() {
      return dispose$.isStopped;
    },
    dispose$: dispose$.pipe(share()),
    dispose,
    tree,
  };
}
