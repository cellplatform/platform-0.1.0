import { filter } from 'rxjs/operators';

import { Context, Handler, Model, rx, t } from '../common';
import { Select as Component } from './Select';
import { config } from './SelectDef.config';

type T = t.ActionSelect;
type P = t.ActionSelectHandlerArgs<any>;
type S = t.ActionHandlerSettings<P>;
type A = t.ActionHandlerSettingsSelectArgs;
type E = t.IActionSelectEvent;

export const SelectDef: t.ActionDef<T, E> = {
  kind: 'dev/select',
  Component,

  config: {
    method: 'select',
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
    rx.payload<E>(args.event$, 'dev:action/Select')
      .pipe(
        filter((e) => e.item.id === args.id),
        filter((e) => e.item.handlers.length > 0),
      )
      .subscribe((e) => {
        Context.getAndStore(actions, { throw: true });
        actions.change((draft) => {
          const { ctx, item, host, layout, env } = Handler.params.payload<T>(e.item.id, draft);
          if (ctx && item) {
            const settings: S = (args) =>
              Handler.settings.handler<P, A>({
                env,
                payload,
                syncSource: (args) => args.select,
                syncTarget: item,
              })(args);

            const changing = e.changing;
            const select = item;
            const payload: P = { ctx, changing, host, layout, select, settings };
            if (changing) item.current = changing.next; // Update the item to the latest selection.

            /**
             * TODO 🐷
             * - put within [runtime.web] piped execution, like [runtime.node]
             * - handle async
             */

            console.log('TODO: piped [Select] handlers');

            for (const fn of e.item.handlers) {
              fn(payload);
            }
          }
        });
      });

    // Initial state.
    if (item.handlers.length > 0) {
      args.fire({
        type: 'dev:action/Select',
        payload: { namespace, item },
      });
    }
  },
};
