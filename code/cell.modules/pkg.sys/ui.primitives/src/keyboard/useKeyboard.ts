import { useEffect, useRef } from 'react';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { R, rx, t } from '../common';
import { DEFAULT, SINGLETON_INSTANCE } from './constants';
import { KeyboardEvents } from './Keyboard.Events';
import { KeyboardStateMonitor } from './Keyboard.State';
import { useKeyboardEventPipe } from './useKeyboardEventPipe';

type Id = string;

export type KeyboardHookArgs = {
  bus?: t.EventBus<any>;
  instance?: Id;
  dispose$?: Observable<any>;
};

/**
 * Hook for working with the current/changing state of the keyboard.
 *
 * NOTE: Does not cause redraws.
 */
export function useKeyboard(args: KeyboardHookArgs): t.KeyboardStateHook {
  const { instance = SINGLETON_INSTANCE } = args;
  const alive = Boolean(args.bus);
  const bus = args.bus ? rx.busAsType<t.KeyboardEvent>(args.bus) : rx.bus();
  const busid = args.bus ? rx.bus.instance(bus) : '';

  useKeyboardEventPipe({ bus, instance }); // NB: Singleton (ensure the keyboard events are piping into the bus).

  const stateRef$ = useRef(new Subject<t.KeyboardState>());
  const stateRef = useRef<t.KeyboardState>(R.clone(DEFAULT.STATE));

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    const state$ = stateRef$.current;
    const monitor = KeyboardStateMonitor({ bus, instance });
    monitor.state$.subscribe((e) => state$.next(e));
    return () => monitor.dispose();
  }, [bus, busid, instance]); // eslint-disable-line

  /**
   * API
   */
  return {
    bus: busid,
    instance,
    alive,
    events: (args) => KeyboardEvents({ ...args, bus, instance }),
    state$: stateRef$.current.pipe(takeUntil(args.dispose$ || new Subject())),
    get state() {
      return stateRef.current;
    },
  };
}
