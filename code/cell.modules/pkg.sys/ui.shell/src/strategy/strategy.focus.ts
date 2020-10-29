import { events } from '@platform/react';
import { filter, takeUntil } from 'rxjs/operators';

import { t } from '../common';

type E = t.ShellEvent;
type P = t.ShellProps;

const CURSOR = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

/**
 * Listens for focus-triggering events and ensure the Shell parts (such as the tree)
 * recieve the correct focus triggers.
 */
export function focusStrategy(args: { shell: t.ShellModule; bus: t.EventBus<E> }) {
  const { shell, bus } = args;

  /**
   * Listen for keyboard events.
   */
  const keypress$ = events.keyPress$.pipe(
    takeUntil(shell.dispose$),
    filter((e) => e.isPressed),
  );

  const cursorKey$ = keypress$.pipe(filter((e) => CURSOR.includes(e.key)));

  /**
   * Ensure treeview has focus when cursor keys are pressed.
   */
  cursorKey$.subscribe((e) => {
    bus.fire({ type: 'Shell/focus', payload: { region: 'Tree' } });
  });
}
