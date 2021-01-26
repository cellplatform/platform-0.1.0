import { useEffect } from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { getAndStoreContext, Handler } from '../../api/actions';
import { toObject, rx, t } from '../../common';

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

    const Model = {
      change(action: t.DevActionsChangeType, fn: (draft: t.DevActionsModel<any>) => void) {
        return model.change(fn, { action });
      },
      payload<T extends t.DevActionItemInput>(itemId: string, draft: t.DevActionsModel<any>) {
        const ctx = draft.ctx.current;
        const env = draft.env.viaAction;
        const { host, layout } = Handler.action({ ctx, env });
        const item = draft.items.find((item) => item.id === itemId) as T;
        return { ctx, host, item, layout, env };
      },
    };

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
            bus.fire({
              type: 'dev:action/item:changed',
              payload: { ns, index, model: item },
            });
          }
        });
      });

    /**
     * Button
     */
    rx.payload<t.IDevActionButtonEvent>($, 'dev:action/button')
      .pipe()
      .subscribe((e) => {
        const { id, handler } = e.model;
        if (handler) {
          type T = t.DevActionItemButton;
          type P = t.DevActionButtonHandlerArgs<any>;
          type S = t.DevActionHandlerSettings<P>;

          getAndStoreContext(model, { throw: true }); // NB: This will also assign the [ctx.current] value.

          Model.change('via:button', (draft) => {
            const { ctx, item, host, layout, env } = Model.payload<T>(id, draft);
            if (ctx && item) {
              const settings: S = (args) => Handler.settings({ env, payload })(args);
              const payload: P = { ctx, host, layout, settings };
              handler(payload);
            }
          });
        }
      });

    /**
     * Boolean (Switch)
     */
    rx.payload<t.IDevActionBooleanEvent>($, 'dev:action/boolean')
      .pipe()
      .subscribe((e) => {
        const { id, handler } = e.model;
        if (handler) {
          type T = t.DevActionItemBoolean;
          type P = t.DevActionBooleanHandlerArgs<any>;
          type S = t.DevActionHandlerSettings<P>;

          getAndStoreContext(model, { throw: true }); // NB: This will also assign the [ctx.current] value.

          Model.change('via:boolean', (draft) => {
            const { ctx, item, host, layout, env } = Model.payload<T>(id, draft);
            if (ctx && item) {
              const settings: S = (args) => Handler.settings({ env, payload })(args);
              const payload: P = { ctx, change: e.change, host, layout, settings };
              item.current = handler(payload);
            }
          });
        }
      });

    /**
     * Setup the initial model state by running each value producing handler.
     */
    model.state.items.forEach((model) => {
      if (model.kind === 'boolean' && model.handler) {
        bus.fire({ type: 'dev:action/boolean', payload: { ns, model, change: false } });
      }
    });

    return () => dispose$.next();
  }, [bus, actions, ns]);
}
