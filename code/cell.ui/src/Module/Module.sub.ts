import { Subject } from 'rxjs';
import { share } from 'rxjs/operators';

import { t } from '../common';
import { create as createEvents } from './Module.events';

type N = t.ITreeNode;

/**
 * Subscribe to changes on a particular module.
 */
export function subscribe<T extends N = N>(
  args: t.ModuleSubscribeArgs<T>,
): t.ModuleSubscribeResponse<T> {
  const tree = args.tree;
  const dispose$ = new Subject<void>();
  const dispose = () => dispose$.next();
  if (args.until$) {
    args.until$.subscribe(() => dispose());
  }

  const events = args.filter
    ? createEvents(args.event$, args.until$).filter(args.filter)
    : createEvents(args.event$, args.until$);

  const change = (to: t.ITreeNode) => {
    tree.change((draft) => {
      draft.props = to.props;
      draft.children = to.children;
    });
  };

  events.changed$.subscribe((e) => {
    change(e.change.to);
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
