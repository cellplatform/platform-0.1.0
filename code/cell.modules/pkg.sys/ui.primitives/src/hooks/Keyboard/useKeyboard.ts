import { useEffect, useState } from 'react';

import { R, rx, t } from '../common';
import { DEFAULT, SINGLETON_INSTANCE } from './constants';
import { KeyboardEvents } from './Keyboard.Events';
import { KeyboardStateMonitor } from './Keyboard.State';
import { useKeyboardEventPipe } from './useKeyboardEventPipe';

type Id = string;

export type KeyboardHookArgs = { bus: t.EventBus<any>; instance?: Id };

/**
 * Hook for working with the current/changing state of the keyboard.
 */
export function useKeyboard(args: KeyboardHookArgs): t.KeyboardHook {
  const { instance = SINGLETON_INSTANCE } = args;
  const bus = rx.busAsType<t.KeyboardEvent>(args.bus);
  const busInstance = rx.bus.instance(bus);

  useKeyboardEventPipe({ bus, instance }); // NB: Singleton (ensure the keyboard events are piping into the bus).
  const [state, setState] = useState<t.KeyboardState>(R.clone(DEFAULT.STATE));

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    const monitor = KeyboardStateMonitor({ bus, instance });
    monitor.state$.subscribe((e) => setState(e));
    return () => monitor.dispose();
  }, [bus, busInstance, instance]);

  /**
   * API
   */
  return {
    bus: busInstance,
    instance,
    state,
    events: (args) => KeyboardEvents({ ...args, bus }),
  };
}
