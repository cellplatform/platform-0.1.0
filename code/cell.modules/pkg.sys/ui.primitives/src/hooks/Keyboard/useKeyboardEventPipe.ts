import { useEffect } from 'react';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { rx, t } from '../common';
import { Util } from '../UIEvent/util';
import { SINGLETON_INSTANCE } from './constants';
import { KeyboardEvents } from './Keyboard.Events';

type Id = string;
type Listener = { $: Observable<KeyboardEvent>; dispose(): void };

const singletonByBus: { [key: string]: number } = {};
let singletonListener: Listener | undefined;

export type KeyboardEventPipeHookArgs = { bus: t.EventBus<any>; instance?: Id };

/**
 * Hook for piping a set of keyboard events through an event-bus.
 *
 * <SINGLETON>
 *     NB: If the same bus is passed multiple times, it will only
 *     recieve the keyboard events once (de-duped).
 *
 */
export function useKeyboardEventPipe(args: KeyboardEventPipeHookArgs): t.KeyboardPipeHook {
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
    if (singletonByBus[busInstance] === undefined) singletonByBus[busInstance] = 0;
    singletonByBus[busInstance]++;

    const fire = (e: KeyboardEvent) => {
      const { code, key, isComposing, location, repeat } = e;
      if (key === 'Dead') return; // REF: https://en.wikipedia.org/wiki/Dead_key

      const name = e.type === 'keydown' ? 'onKeydown' : 'onKeyup';
      const is = toFlags(e);
      const stage: t.KeyboardStage = is.down ? 'Down' : 'Up';

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
        payload: { instance, name, key, keypress, is, stage },
      });
    };

    /**
     * NOTE: Only pipe for the first instance of the bus.
     *       All other usages of this hook are ignored as the common
     *       bus will be getting a single set of keyboard events.
     */
    if (singletonByBus[busInstance] === 1) {
      $.pipe(takeUntil(dispose$)).subscribe(fire);
    }

    /**
     * Dispose.
     */
    return () => {
      dispose$.next();
      singletonByBus[busInstance]--;
      if (singletonByBus[busInstance] <= 0) delete singletonByBus[busInstance];
    };
  }, [bus, busInstance, instance]);

  /**
   * API
   */
  return {
    bus: busInstance,
    instance,
    listeners: singletonByBus[busInstance] ?? 0,
    events: (args) => KeyboardEvents({ ...args, bus }),
  };
}

/**
 * Helpers
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

function toFlags(e: KeyboardEvent): t.KeyboardKeyFlags {
  return {
    down: e.type === 'keydown',
    up: e.type === 'keyup',
    modifier: ['Shift', 'Alt', 'Control', 'Meta'].includes(e.key),
    number: e.code.startsWith('Digit') || e.code.startsWith('Numpad'),
    letter: e.code.startsWith('Key'),
    arrow: e.code.startsWith('Arrow'),
    enter: e.code === 'Enter',
    escape: e.code === 'Escape',
  };
}
