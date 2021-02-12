import { filter } from 'rxjs/operators';

import { Context, Handler, Model, rx, t } from '../common';
import { Bool as Component } from './Bool';
import { config } from './BooleanDef.config';

type T = t.ActionBoolean;
type P = t.ActionBooleanHandlerArgs<any>;
type S = t.ActionHandlerSettings<P>;
type A = t.ActionHandlerSettingsBooleanArgs;
type E = t.IActionBooleanEvent;

export const BooleanDef: t.ActionDef<T, E> = {
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

    // Listen for events.
    rx.payload<E>(args.event$, 'dev:action/Boolean')
      .pipe(filter((e) => e.item.handlers.length > 0))
      .subscribe((e) => {
        Context.getAndStore(actions, { throw: true });
        actions.change((draft) => {
          const { ctx, item, host, layout, env } = Handler.params.payload<T>(e.item.id, draft);
          if (ctx && item) {
            const settings: S = (args) =>
              Handler.settings.handler<P, A>({
                env,
                payload,
                syncSource: (args) => args.boolean,
                syncTarget: item,
              })(args);

            const changing = e.changing;
            const boolean = item;
            const payload: P = { ctx, changing, host, layout, boolean, settings };
            if (changing) item.current = changing.next;

            /**
             * TODO 🐷
             * - put within [runtime.web] piped execution, like [runtime.node]
             * - handle async
             */

            console.log('TODO: piped [Boolean] handlers');

            for (const fn of e.item.handlers) {
              fn(payload);
            }
          }
        });
      });

    // Initial state.
    if (item.handlers.length > 0) {
      args.fire({
        type: 'dev:action/Boolean',
        payload: { namespace, item },
      });
    }
  },
};
