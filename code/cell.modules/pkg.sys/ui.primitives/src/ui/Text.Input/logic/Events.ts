import { filter, takeUntil } from 'rxjs/operators';

import { rx, t } from '../common';

export type TextInputEventsArgs = {
  instance: t.CmdCardInstance;
  dispose$?: t.Observable<any>;
};

/**
 * Event API
 */
export function TextInputEvents(args: TextInputEventsArgs) {
  const { dispose, dispose$ } = rx.disposable(args.dispose$);

  const instance = args.instance.id;
  const bus = rx.busAsType<t.TextInputEvent>(args.instance.bus);

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => e.type.startsWith('sys.ui.TextInput/')),
    filter((e) => e.payload.instance === instance),
  );

  const text: t.TextInputEvents['text'] = {
    changing$: rx.payload<t.TextInputChangingEvent>($, 'sys.ui.TextInput/Changing'),
    changed$: rx.payload<t.TextInputChangedEvent>($, 'sys.ui.TextInput/Changed'),
  };

  /**
   * API
   */
  const api: t.TextInputEventsDisposable = {
    instance: { bus: rx.bus.instance(bus), id: instance },
    $,
    dispose,
    dispose$,
    text,
    clone() {
      return { ...api, dispose: undefined };
    },
  };
  return api;
}
