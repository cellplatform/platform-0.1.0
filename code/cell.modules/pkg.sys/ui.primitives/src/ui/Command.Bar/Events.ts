import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { rx } from '../common';
import * as k from './types';

/**
 * Event API.
 */
export const CommandBarEvents: k.CommandBarEventsFactory = (args) => {
  const { instance } = args;
  const dispose$ = new Subject<void>();
  const dispose = () => dispose$.next();
  const bus = rx.busAsType<k.CommandBarEvent>(args.bus);

  const $ = bus.$.pipe(filter((e) => e.payload.instance === instance));

  const action: k.CommandBarEvents['action'] = {
    $: rx.payload<k.CommandBarActionEvent>($, 'sys.ui.CommandBar/Action'),
    fire(args) {
      const { text } = args;
      bus.fire({
        type: 'sys.ui.CommandBar/Action',
        payload: { instance, text },
      });
    },
  };

  const text: k.CommandBarEvents['text'] = {
    changed$: rx.payload<k.CommandBarTextChangeEvent>($, 'sys.ui.CommandBar/TextChanged'),
    changed(args) {
      const { from, to } = args;
      bus.fire({
        type: 'sys.ui.CommandBar/TextChanged',
        payload: { instance, from, to },
      });
    },
  };

  return { $, dispose, dispose$, action, text };
};
