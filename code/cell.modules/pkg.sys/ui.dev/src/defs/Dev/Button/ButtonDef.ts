import { filter } from 'rxjs/operators';

import { Context, Handler, Model, rx, t, is, toObject } from '../common';
import { Button as Component } from '../../../ui/Action.Dev';
import { config } from './ButtonDef.config';

type T = t.ActionButton;
type P = t.ActionButtonHandlerArgs<any>;
type S = t.ActionHandlerSettings<P>;
type A = t.ActionHandlerSettingsButtonArgs;
type E = t.IActionButtonEvent;

export const ButtonDef: t.ActionDef<T> = {
  kind: 'dev/button',
  Component,

  config: {
    method: 'button',
    handler(args) {
      const { item } = config(args.ctx, args.params);
      args.actions.change((draft) => draft.items.push(item));
    },
  },

  listen(args) {
    const { actions } = args;
    const bus = rx.busAsType<E>(args.bus);
    const redraw = () => args.actions.state.redraw$.next();

    // Listen for events.
    rx.payload<E>(bus.$, 'sys.ui.dev/action/Button')
      .pipe(
        filter((e) => e.item.id === args.id),
        filter((e) => e.item.handlers.length > 0),
      )
      .subscribe(async (e) => {
        Context.getAndStore(actions, { throw: true });
        const { id } = e.item;

        const isSpinning = (value: boolean) =>
          actions.change((draft) => (Model.item<T>(draft, id).item.isSpinning = value));
        isSpinning(false);

        await actions.changeAsync(async (draft) => {
          const { ctx, item, host, layout, actions, env } = Handler.params.payload<T>(id, draft);
          if (ctx && item) {
            const settings: S = (args) =>
              Handler.settings.handler<P, A>({
                env,
                payload,
                sync: { source: (args) => args.button, target: item },
              })(args);

            const button = item as t.ActionButtonProps;
            const payload: P = { ctx, host, layout, actions, settings, button, toObject, redraw };

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
  },
};
