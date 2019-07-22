import { Observable, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { Keyboard, t, coord } from '../../common';

/**
 * Manages clipboard operations
 */
export function clipboard(args: {
  grid: t.IGrid;
  events$: Subject<t.GridEvent>;
  dispose$: Observable<{}>;
}) {
  const { grid } = args;

  /**
   * Setup observables.
   */
  const events$ = args.events$.pipe(takeUntil(args.dispose$));
  const keydown$ = events$.pipe(
    filter(e => e.type === 'GRID/keydown'),
    filter(e => grid.isReady),
    filter(e => !grid.isEditing),
    map(e => e.payload as t.IGridKeydown),
  );
  const copy$ = keydown$.pipe(filter(e => Keyboard.matchEvent('Meta+C', e)));
  const cut$ = keydown$.pipe(filter(e => Keyboard.matchEvent('Meta+X', e)));
  const paste$ = keydown$.pipe(filter(e => Keyboard.matchEvent('Meta+V', e)));

  /**
   * Fire clipboard events.
   */
  copy$.subscribe(e => fire('COPY'));
  cut$.subscribe(e => fire('CUT'));
  paste$.subscribe(e => fire('PASTE'));

  const fire = (action: t.IGridClipboard['action']) => {
    const selection = grid.selection;
    let union: coord.range.CellRangeUnion | undefined;
    const payload: t.IGridClipboard = {
      action,
      grid,
      selection,
      get keys() {
        union = union || coord.range.union(selection.ranges);
        return union.keys;
      },
    };

    args.events$.next({
      type: 'GRID/clipboard',
      payload,
    });
  };
}
