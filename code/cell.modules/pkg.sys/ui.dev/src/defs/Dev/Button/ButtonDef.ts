import { filter } from 'rxjs/operators';

import { Context, Handler, Model, rx, t, is } from '../common';
import { Button as Component } from './Button';
import { config } from './ButtonDef.config';

type T = t.ActionButton;
type P = t.ActionButtonHandlerArgs<any>;
type S = t.ActionHandlerSettings<P>;
type A = t.ActionHandlerSettingsButtonArgs;
type E = t.IActionButtonEvent;

export const ButtonDef: t.ActionDef<T, E> = {
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

    // Listen for events.
    rx.payload<E>(args.event$, 'dev:action/Button')
      .pipe(
        filter((e) => e.item.id === args.id),
        filter((e) => e.item.handlers.length > 0),
      )
      .subscribe((e) => {
        Context.getAndStore(actions, { throw: true });

        actions.change((draft) => {
          const { ctx, item, host, layout, env } = Handler.params.payload<T>(e.item.id, draft);
          if (ctx && item) {
            //

            const settings: S = (args) =>
              Handler.settings.handler<P, A>({
                env,
                payload,
                syncSource: (args) => args.button,
                syncTarget: item,
              })(args);

            const button = item as t.ActionButtonProps;
            const payload: P = { ctx, host, layout, settings, button };

            /**
             * TODO 🐷
             * - put within [runtime.web] piped execution, like [runtime.node]
             * - handle async
             */

            console.log('TODO: piped [Button] handlers');

            for (const fn of e.item.handlers) {
              fn(payload);
            }
          }
        });
      });
  },
};
