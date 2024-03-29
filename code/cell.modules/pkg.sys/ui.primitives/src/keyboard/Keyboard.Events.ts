import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { rx, t } from '../common';
import { SINGLETON_INSTANCE } from './constants';
import { toKey } from './Keyboard.Events.toKey';

type Id = string;

/**
 * Event API.
 */
export function KeyboardEvents(args: {
  bus: t.EventBus<any>;
  instance?: Id;
  dispose$?: Observable<any>;
}): t.KeyboardEvents {
  const { instance = SINGLETON_INSTANCE } = args;
  const bus = rx.busAsType<t.KeyboardEvent>(args.bus);

  const dispose$ = new Subject<void>();
  const dispose = () => dispose$.next();
  args.dispose$?.subscribe(dispose);

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => e.type.startsWith('sys.ui.keyboard/')),
    filter((e) => e.payload.instance === instance),
  );

  const keypress$ = rx.payload<t.KeyboardKeypressEvent>($, 'sys.ui.keyboard/keypress');
  const down$ = keypress$.pipe(filter((e) => e.is.down));
  const up$ = keypress$.pipe(filter((e) => e.is.up));

  let _down: undefined | t.KeyboardKeyEvents;
  let _up: undefined | t.KeyboardKeyEvents;

  /**
   * API
   */
  return {
    $,
    dispose,
    dispose$,
    keypress$,
    down$,
    up$,
    get down() {
      return _down || (_down = toKey(keypress$, 'Down'));
    },
    get up() {
      return _up || (_up = toKey(keypress$, 'Up'));
    },
  };
}
