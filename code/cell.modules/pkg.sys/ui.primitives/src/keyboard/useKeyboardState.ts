import { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { rx, t } from '../common';
import { KeyboardHookArgs, useKeyboard } from './useKeyboard';

export type KeyboardStateHookArgs = KeyboardHookArgs;

/**
 * Hook for working with the current/changing state of the keyboard.
 * NOTE:
 *    Causes redraws (as a feature).
 *    To observe changes via events, use the base hook [useKeyboard] directly.
 */
export function useKeyboardState(args: KeyboardStateHookArgs): t.KeyboardStateHook {
  const keyboard = useKeyboard(args);
  const [state, setState] = useState<t.KeyboardState>(keyboard.state);

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    const dispose$ = new Subject<void>();
    keyboard.state$.pipe(takeUntil(dispose$)).subscribe(setState);
    return () => rx.done(dispose$);
  }, [keyboard.bus, keyboard.instance]); // eslint-disable-line

  /**
   * API
   */
  return { ...keyboard, state };
}
