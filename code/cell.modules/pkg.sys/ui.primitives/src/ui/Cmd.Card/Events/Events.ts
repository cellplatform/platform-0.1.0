import { filter, takeUntil } from 'rxjs/operators';

import { rx, t, Patch, slug } from '../common';

/**
 * Event API
 */
export const CmdCardEvents: t.CmdCardEventsFactory = (args) => {
  const { dispose, dispose$ } = rx.disposable(args.dispose$);

  const instance = args.instance.id;
  const bus = rx.busAsType<t.CmdCardEvent>(args.instance.bus);

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => e.type.startsWith('sys.ui.CmdCard/')),
    filter((e) => e.payload.instance === instance),
  );

  const state: t.CmdCardEvents['state'] = {
    req$: rx.payload<t.CmdCardStateReqEvent>($, 'sys.ui.CmdCard/state:req'),
    res$: rx.payload<t.CmdCardStateResEvent>($, 'sys.ui.CmdCard/state:res'),
    patch$: rx.payload<t.CmdCardStatePatchEvent>($, 'sys.ui.CmdCard/state:patch'),

    async get(options = {}) {
      const { timeout = 3000 } = options;
      const tx = slug();

      const op = 'info';
      const res$ = state.res$.pipe(filter((e) => e.tx === tx));
      const first = rx.asPromise.first<t.CmdCardStateResEvent>(res$, { op, timeout });

      bus.fire({
        type: 'sys.ui.CmdCard/state:req',
        payload: { tx, instance },
      });

      const res = await first;
      if (res.payload) return res.payload;

      const error = res.error?.message ?? 'Failed';
      return { tx, instance, error };
    },

    async mutate(handler) {
      const current = await state.get();
      if (current.error) throw new Error(current.error);
      if (!current.state) {
        const err = `Failed to mutate, could not retrieve current state. Ensure the controller has been started.`;
        throw new Error(err);
      }

      const { op, patches } = await Patch.changeAsync(current.state, handler);
      bus.fire({
        type: 'sys.ui.CmdCard/state:patch',
        payload: { instance, op, patches },
      });
    },
  };

  /**
   * API
   */
  const api: t.CmdCardEvents = {
    instance: { bus: rx.bus.instance(bus), id: instance },
    $,
    dispose,
    dispose$,
    state,
  };
  return api;
};
