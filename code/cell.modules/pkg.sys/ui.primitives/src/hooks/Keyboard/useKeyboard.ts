import { useEffect, useState } from 'react';

import { R, rx, t } from '../common';
import { DEFAULT, SINGLETON_INSTANCE } from './constants';
import { KeyboardStateMonitor } from './Keyboard.State';
import { useKeyboardPipe } from './useKeyboardPipe';
import { KeyboardEvents } from './Keyboard.Events';

type Id = string;

export type KeyboardHookArgs = { bus: t.EventBus<any>; instance?: Id };

/**
 * Hook for working with the current/changing state of the keyboard.
 */
export function useKeyboard(args: KeyboardHookArgs): t.KeyboardHook {
  const { instance = SINGLETON_INSTANCE } = args;
  const bus = rx.busAsType<t.KeyboardEvent>(args.bus);
  const busInstance = rx.bus.instance(bus);

  useKeyboardPipe({ bus, instance }); // NB: Singleton (ensure the keyboard events are piping into the bus).
  const [current, setCurrent] = useState<t.KeyboardState>(R.clone(DEFAULT.STATE));

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    const monitor = KeyboardStateMonitor({ bus, instance });
    monitor.current$.subscribe((e) => setCurrent(e));
    return () => monitor.dispose();
  }, [bus, busInstance, instance]);

  /**
   * API
   */
  return {
    bus: busInstance,
    instance,
    current,
    events: (args) => KeyboardEvents({ ...args, bus }),
  };
}
