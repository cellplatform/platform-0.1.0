import { animationFrameScheduler, Subject } from 'rxjs';
import { filter, observeOn, takeUntil } from 'rxjs/operators';

import { rx } from './common';
import * as k from './types';

/**
 * Event API.
 */
export const CmdBarEvents: k.CmdBarEventsFactory = (args) => {
  const { instance } = args;
  const dispose$ = new Subject<void>();
  const dispose = () => dispose$.next();
  const bus = rx.busAsType<k.CmdBarEvent>(args.bus);

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => e.payload.instance === instance),
    filter((e) => e.type.startsWith('sys.ui.CmdBar/')),
    observeOn(animationFrameScheduler),
  );

  const action: k.CmdBarEvents['action'] = {
    $: rx.payload<k.CmdBarActionEvent>($, 'sys.ui.CmdBar/Action'),
    fire(args) {
      const { text } = args;
      bus.fire({
        type: 'sys.ui.CmdBar/Action',
        payload: { instance, text },
      });
    },
  };

  const text: k.CmdBarEvents['text'] = {
    changed$: rx.payload<k.CmdBarTextChangeEvent>($, 'sys.ui.CmdBar/TextChanged'),
    changed(args) {
      const { from, to } = args;
      bus.fire({
        type: 'sys.ui.CmdBar/TextChanged',
        payload: { instance, from, to },
      });
    },
  };

  return { instance, $, dispose, dispose$, action, text };
};
