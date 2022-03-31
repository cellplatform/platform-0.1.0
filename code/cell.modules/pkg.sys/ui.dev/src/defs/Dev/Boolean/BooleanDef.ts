import { filter } from 'rxjs/operators';

import { Context, Handler, Model, rx, t, is, toObject } from '../common';
import { Bool as Component } from '../../../ui/Action.Dev';
import { config } from './BooleanDef.config';

type T = t.ActionBoolean;
type P = t.ActionBooleanHandlerArgs<any>;
type S = t.ActionHandlerSettings<P>;
type A = t.ActionHandlerSettingsBooleanArgs;
type E = t.IActionBooleanEvent;

export const BooleanDef: t.ActionDef<T> = {
  kind: 'dev/boolean',
  Component,

  config: {
    method: 'boolean',
    handler(args) {
      const { item } = config(args.ctx, args.params);
      args.actions.change((draft) => draft.items.push(item));
    },
  },

  listen(args) {
    const { actions } = args;
    const { item } = Model.item<T>(actions, args.id);
    const namespace = actions.state.namespace;
    const bus = rx.busAsType<E>(args.bus);
    const redraw = () => args.actions.state.redraw$.next();

    // Listen for events.
    rx.payload<E>(bus.$, 'sys.ui.dev/action/Boolean')
      .pipe(
        filter((e) => e.item.id === args.id),
        filter((e) => e.item.handlers.length > 0),
      )
      .subscribe((e) => {
        Context.getAndStore(actions, { throw: true });

        const { id } = e.item;
        const isSpinning = (value: boolean) =>
          actions.change((draft) => (Model.item<T>(draft, id).item.isSpinning = value));
        isSpinning(false);

        actions.changeAsync(async (draft) => {
          const { ctx, item, host, layout, actions, env } = Handler.params.payload<T>(id, draft);
          if (ctx && item) {
            const settings: S = (args) =>
              Handler.settings.handler<P, A>({
                env,
                payload,
                sync: { source: (args) => args.boolean, target: item },
              })(args);

            const changing = e.changing;
            const boolean = item;
            const payload: P = {
              ctx,
              changing,
              host,
              layout,
              actions,
              boolean,
              settings,
              toObject,
              redraw,
            };
            if (changing) item.current = changing.next;

            for (const fn of e.item.handlers) {
              const res = fn(payload);
              if (is.promise(res)) {
                isSpinning(true);
                await res;
                isSpinning(false);
              }
            }
          }
        });
      });

    // Initial state.
    if (item.handlers.length > 0) {
      bus.fire({
        type: 'sys.ui.dev/action/Boolean',
        payload: { namespace, item },
      });
    }
  },
};
