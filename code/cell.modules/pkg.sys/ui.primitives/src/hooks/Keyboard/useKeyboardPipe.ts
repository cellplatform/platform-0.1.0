import { useEffect } from 'react';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { rx, t } from '../common';
import { Util } from '../UIEvents/util';
import { KeyboardEvents } from './Keyboard.Events';
import { SINGLETON_INSTANCE } from './constants';

type Id = string;
type Listener = { $: Observable<KeyboardEvent>; dispose(): void };

const singleton: { [key: string]: number } = {};
let singletonListener: Listener | undefined;

export type KeyboardPipeHookArgs = { bus: t.EventBus<any>; instance?: Id };

/**
 * Hook for piping a set of keyboard events through an event-bus.
 *
 * <SINGLETON>
 *     NB: If the same bus is passed multiple times, it will only
 *     recieve the keyboard events once (de-duped).
 *
 */
export function useKeyboardPipe(args: KeyboardPipeHookArgs): t.KeyboardPipeHook {
  const { instance = SINGLETON_INSTANCE } = args;
  const bus = rx.busAsType<t.KeyboardEvent>(args.bus);
  const busInstance = rx.bus.instance(bus);

  /**
   * Lifecycle
   */
  useEffect(() => {
    if (!singletonListener) singletonListener = listen();
    const $ = singletonListener.$;
    const dispose$ = new Subject<void>();

    // Append singleton count.
    if (singleton[busInstance] === undefined) singleton[busInstance] = 0;
    singleton[busInstance]++;

    const fire = (e: KeyboardEvent) => {
      const { code, key, isComposing, location, repeat } = e;
      const name = e.type === 'keydown' ? 'onKeydown' : 'onKeyup';
      const is = { down: name === 'onKeydown', up: name === 'onKeyup' };
      const keypress: t.KeyboardKeypressProps = {
        ...Util.toBase(e),
        ...Util.toModifierKeys(e),
        code,
        key,
        isComposing,
        location,
        repeat,
      };
      bus.fire({
        type: 'sys.ui.keyboard/keypress',
        payload: { instance, name, keypress, is },
      });
    };

    /**
     * NOTE: Only pipe for the first instance of the bus.
     *       All other usages of this hook are ignored as the common
     *       bus will be getting a single set of keyboard events.
     */
    if (singleton[busInstance] === 1) {
      $.pipe(takeUntil(dispose$)).subscribe(fire);
    }

    /**
     * Dispose.
     */
    return () => {
      dispose$.next();
      singleton[busInstance]--;
      if (singleton[busInstance] <= 0) delete singleton[busInstance];
    };
  }, [bus, busInstance, instance]);

  /**
   * API
   */
  return {
    bus: busInstance,
    instance,
    listeners: singleton[busInstance] ?? 0,
    events: (args) => KeyboardEvents({ ...args, bus }),
  };
}

/**
 * Listener
 */
function listen() {
  const $ = new Subject<KeyboardEvent>();
  const handler = (e: KeyboardEvent) => $.next(e);
  document.addEventListener('keydown', handler);
  document.addEventListener('keyup', handler);
  return {
    $,
    dispose() {
      document.removeEventListener('keydown', handler);
      document.removeEventListener('keyup', handler);
    },
  };
}
