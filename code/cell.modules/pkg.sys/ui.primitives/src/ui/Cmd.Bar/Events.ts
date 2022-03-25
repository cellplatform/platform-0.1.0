import { animationFrameScheduler, Subject } from 'rxjs';
import { filter, observeOn, takeUntil } from 'rxjs/operators';

import { rx, t } from './common';

/**
 * Event API.
 */
export const CmdBarEvents: t.CmdBarEventsFactory = (args) => {
  const { instance } = args;
  const dispose$ = new Subject<void>();
  const dispose = () => dispose$.next();
  const bus = rx.busAsType<t.CmdBarEvent>(args.bus);

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => e.payload.instance === instance),
    filter((e) => e.type.startsWith('sys.ui.CmdBar/')),
    observeOn(animationFrameScheduler),
  );

  const action: t.CmdBarEvents['action'] = {
    $: rx.payload<t.CmdBarActionEvent>($, 'sys.ui.CmdBar/Action'),
    fire(args) {
      const { text } = args;
      bus.fire({
        type: 'sys.ui.CmdBar/Action',
        payload: { instance, text },
      });
    },
  };

  const text: t.CmdBarEvents['text'] = {
    changed$: rx.payload<t.CmdBarTextChangeEvent>($, 'sys.ui.CmdBar/TextChanged'),
    changed(args) {
      const { from, to } = args;
      bus.fire({
        type: 'sys.ui.CmdBar/TextChanged',
        payload: { instance, from, to },
      });
    },
  };

  return {
    bus: rx.bus.instance(bus),
    instance,
    $,
    dispose,
    dispose$,
    action,
    text,
  };
};
