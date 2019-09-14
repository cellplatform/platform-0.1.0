import { Observable, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { Keyboard, t } from '../../common';

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
   * Setup observables (read key-commands from the grid keyboard-bindings).
   */
  const events$ = args.events$.pipe(takeUntil(args.dispose$));
  const keydown$ = events$.pipe(
    filter(e => e.type === 'GRID/keydown'),
    filter(e => grid.isReady),
    filter(e => !grid.isEditing),
    map(e => e.payload as t.IGridKeydown),
  );

  const is = (command: t.GridClipboardCommand, e: t.IGridKeydown) => {
    const binding = grid.keyBindings.find(binding => binding.command === command);
    return binding ? Keyboard.matchEvent(binding.key, e) : false;
  };

  const cut$ = keydown$.pipe(filter(e => is('CUT', e)));
  const copy$ = keydown$.pipe(filter(e => is('COPY', e)));
  const paste$ = keydown$.pipe(filter(e => is('PASTE', e)));

  /**
   * Fire clipboard events.
   */
  const fire = (action: t.GridClipboardCommand, e: t.IGridKeydown) => {
    const selection = grid.selection;
    let values: t.IGridValues | undefined;

    const payload: t.IGridClipboard = {
      action,
      grid,
      selection,
      get keys() {
        return Object.keys(payload.values);
      },
      get values() {
        values = values || grid.selectionValues;
        return values;
      },
    };

    args.events$.next({
      type: 'GRID/clipboard',
      payload,
    });
  };

  cut$.subscribe(e => fire('CUT', e));
  copy$.subscribe(e => fire('COPY', e));
  paste$.subscribe(e => fire('PASTE', e));
}
