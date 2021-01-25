import { useEffect } from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { getAndStoreContext } from '../../api/actions';
import { rx, t } from '../../common';

type O = Record<string, unknown>;

/**
 * Controller for handling actions.
 */
export function useActionPanelController(args: { bus: t.DevEventBus; actions: t.DevActions<O> }) {
  const { bus, actions } = args;
  const ns = actions.toObject().ns;

  useEffect(() => {
    const model = actions.toModel();
    const dispose$ = new Subject<void>();
    const $ = bus.event$.pipe(
      takeUntil(dispose$),
      filter((e) => e.payload.ns === ns),
    );

    /**
     * Monitor for changes to individual item models and alert listeners.
     * This looks for patch changes to the path:
     *
     *    "item/<index>/current"
     *
     */
    model.event.changed$
      .pipe(
        filter((e) => e.op === 'update'),
        map((e) => e.patches.next.filter((p) => p.path.match(/^items\/\d+\/current/))),
        filter((patches) => patches.length > 0),
        map((patches) => patches.map((patch) => patch.path)),
        map((paths) => paths.map((path) => path.replace(/^items\//, '').replace(/\/current$/, ''))),
        map((paths) => paths.map((path) => parseInt(path))),
      )
      .subscribe((indexes) => {
        indexes.forEach((index) => {
          const item = model.state.items[index];
          if (item) {
            bus.fire({ type: 'Dev/Action/item:changed', payload: { ns, index, model: item } });
          }
        });
      });

    /**
     * Button
     */
    rx.payload<t.IDevActionButtonEvent>($, 'Dev/Action/button')
      .pipe()
      .subscribe((e) => {
        const { handler } = e.model;
        if (handler) {
          getAndStoreContext(model, { throw: true }); // NB: This will also assign the [ctx.current] value.

          type P = t.DevActionButtonHandlerArgs<any>;
          model.change((draft) => {
            const ctx = draft.ctx.current;
            const item = draft.items.find(({ id }) => id === e.model.id) as t.DevActionItemBoolean;
            if (ctx && item) {
              const host = draft.env.host || (draft.env.host = {});
              const payload: P = { ctx, host };
              handler(payload);
            }
          });
        }
      });

    /**
     * Boolean (Switch)
     */
    rx.payload<t.IDevActionBooleanEvent>($, 'Dev/Action/boolean')
      .pipe()
      .subscribe((e) => {
        const { handler } = e.model;
        if (handler) {
          getAndStoreContext(model, { throw: true }); // NB: This will also assign the [ctx.current] value.

          type P = t.DevActionBooleanHandlerArgs<any>;
          model.change((draft) => {
            const ctx = draft.ctx.current;
            const item = draft.items.find(({ id }) => id === e.model.id) as t.DevActionItemBoolean;
            if (ctx && item) {
              const host = draft.env.host || (draft.env.host = {});
              const payload: P = { ctx, change: e.change, host };
              item.current = handler(payload);
            }
          });
        }
      });

    /**
     * Setup initial model state by running each value producing handler.
     */
    model.state.items.forEach((model) => {
      if (model.kind === 'boolean' && model.handler) {
        bus.fire({ type: 'Dev/Action/boolean', payload: { ns, model, change: false } });
      }
    });

    return () => dispose$.next();
  }, [bus, actions, ns]);
}
