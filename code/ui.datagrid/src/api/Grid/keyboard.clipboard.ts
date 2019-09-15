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
   * Setup observables (read key-commands from the grid's keyboard-bindings).
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

  /**
   * Fire clipboard events.
   */
  const fire = (command: t.GridClipboardCommand, e: t.IGridKeydown) => {
    const payload: t.IGridCommand = {
      command,
      grid,
      isCancelled: false,
      cancel: () => (payload.isCancelled = true),
    };
    args.events$.next({
      type: 'GRID/command',
      payload,
    });
  };

  const monitor = (cmd: t.GridClipboardCommand) =>
    keydown$.pipe(filter(e => is(cmd, e))).subscribe(e => fire(cmd, e));

  monitor('CUT');
  monitor('COPY');
  monitor('PASTE');
}
