import { Observable, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { t } from '../common';

/**
 * Sets up a syncronization relationship with the given source.
 */
export function syncFrom(args: {
  target: t.ITreeState<any>;
  source$: Observable<t.TreeStateEvent>;
  parent?: string;
  initial?: t.ITreeNode;
  until$?: Observable<any>;
}): t.TreeStateSyncer {
  const { target } = args;

  const parent = (args.parent || '').trim();
  if (!parent) {
    const err = `Cannot sync: parent node not specified.`;
    throw new Error(err);
  }
  if (!target.query.exists(parent)) {
    const err = `Cannot sync: the parent node '${parent}' does not exist in tree '${target.id}'.`;
    throw new Error(err);
  }

  const dispose$ = new Subject<void>();
  const dispose = () => {
    dispose$.next();
    dispose$.complete();
  };
  target.dispose$.subscribe(() => dispose());
  if (args.until$) {
    args.until$.subscribe(() => dispose());
  }

  const source$ = args.source$.pipe(
    takeUntil(dispose$),
    filter((e) => e.type === 'TreeState/changed'),
    map((e) => e.payload as t.ITreeStateChanged),
  );

  const change = (to: t.ITreeNode) => {
    target.change((draft, ctx) => {
      const node = ctx.findById(parent);
      if (node) {
        ctx.children(node, (children) => {
          const index = children.findIndex((child) => child.id === to.id);
          if (index === -1) {
            children.push(to);
          } else {
            children[index] = to;
          }
        });
      }
    });
  };

  if (args.initial) {
    change(args.initial);
  }

  source$.subscribe((e) => {
    change(e.to);
  });

  const syncer: t.TreeStateSyncer = {
    parent,
    dispose$,
    dispose,
  };

  return syncer;
}
