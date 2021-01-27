import { useEffect } from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { getAndStoreContext, Handler } from '../../api/Actions';
import { toObject, rx, t, time } from '../../common';

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
     * Helpers that operate on the model within the context of this closure.
     */
    const Model = {
      change(action: t.DevActionsChangeType, fn: (draft: t.DevActionsModel<any>) => void) {
        getAndStoreContext(model, { throw: true }); // NB: This will also assign the [ctx.current] value.
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
    rx.payload<t.IDevActionButtonEvent>($, 'dev:action/Button')
      .pipe()
      .subscribe((e) => {
        const { id, handler } = e.model;
        if (handler) {
          type T = t.DevActionButton;
          type P = t.DevActionButtonHandlerArgs<any>;
          type S = t.DevActionHandlerSettings<P>;
          type A = t.DevActionHandlerSettingsButtonArgs;

          Model.change('via:button', (draft) => {
            const { ctx, item, host, layout, env } = Model.payload<T>(id, draft);
            if (ctx && item) {
              const settings: S = (args) =>
                Handler.settings<P, A>({ env, payload }, (settings) => {
                  const obj = settings.button;
                  if (obj) Object.keys(obj).forEach((key) => (item[key] = obj[key]));
                })(args);
              const button = item as t.DevActionButtonProps;
              const payload: P = { ctx, host, layout, settings, button };
              handler(payload);
            }
          });
        }
      });

    /**
     * Boolean (Switch)
     */
    rx.payload<t.IDevActionBooleanEvent>($, 'dev:action/Boolean')
      .pipe()
      .subscribe((e) => {
        const { id, handler } = e.model;
        if (handler) {
          type T = t.DevActionBoolean;
          type P = t.DevActionBooleanHandlerArgs<any>;
          type S = t.DevActionHandlerSettings<P>;
          type A = t.DevActionHandlerSettingsBooleanArgs;

          Model.change('via:boolean', (draft) => {
            const { ctx, item, host, layout, env } = Model.payload<T>(id, draft);
            if (ctx && item) {
              const settings: S = (args) =>
                Handler.settings<P, A>({ env, payload }, (settings) => {
                  const obj = settings.boolean;
                  if (obj) Object.keys(obj).forEach((key) => (item[key] = obj[key]));
                })(args);
              const change = e.change;
              const boolean = item as t.DevActionBooleanProps;
              const payload: P = { ctx, change, host, layout, settings, boolean };
              item.current = handler(payload);
            }
          });
        }
      });

    /**
     * Select (dropdown)
     */
    rx.payload<t.IDevActionSelectEvent>($, 'dev:action/Select')
      .pipe()
      .subscribe((e) => {
        const { id, handler } = e.model;
        if (handler) {
          type T = t.DevActionSelect;
          type P = t.DevActionSelectHandlerArgs<any>;
          type S = t.DevActionHandlerSettings<P>;
          type A = t.DevActionHandlerSettingsSelectArgs;

          const res = Model.change('via:select', (draft) => {
            const { ctx, item, host, layout, env } = Model.payload<T>(id, draft);
            if (ctx && item) {
              const settings: S = (args) =>
                Handler.settings<P, A>({ env, payload }, (settings) => {
                  const obj = settings.select;
                  if (obj) Object.keys(obj).forEach((key) => (item[key] = obj[key]));
                })(args);
              const changing = e.changing;
              const select = item as t.DevActionSelectProps;
              const payload: P = { ctx, changing, host, layout, settings, select };
              if (changing) select.current = changing.next; // Update the item to the latest selection.
              handler(payload);
            }
          });
        }
      });

    /**
     * INITIALIZE
     *    Setup the initial model state by invoking
     *    each value producing handler.
     * NOTE:
     *    The delayed tick allows all components to setup their hooks
     *    before the initial state configuration is established.
     */
    time.delay(0, () => {
      model.state.items.forEach((model) => {
        if (model.kind === 'boolean' && model.handler) {
          const change = false; // TODO 🐷 turn into change:{...}
          bus.fire({ type: 'dev:action/Boolean', payload: { ns, model, change } });
        }
        if (model.kind === 'select' && model.handler) {
          bus.fire({ type: 'dev:action/Select', payload: { ns, model } });
        }
      });
    });

    return () => dispose$.next();
  }, [bus, actions, ns]);
}
