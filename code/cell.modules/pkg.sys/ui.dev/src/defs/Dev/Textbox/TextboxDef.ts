import { filter } from 'rxjs/operators';

import { Context, Handler, Model, rx, t, is } from '../common';
import { Textbox as Component } from '../../../components/Action.Dev';
import { config } from './TextboxDef.config';

type T = t.ActionTextbox;
type P = t.ActionTextboxHandlerArgs<any>;
type S = t.ActionHandlerSettings<P>;
type A = t.ActionHandlerSettingsBooleanArgs;
type E = t.IActionTextboxEvent;

export const TextboxDef: t.ActionDef<T, E> = {
  kind: 'dev/textbox',
  Component,

  config: {
    method: 'textbox',
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
    rx.payload<E>(args.event$, 'dev:action/Textbox')
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
            const textbox = item;
            const payload: P = { ctx, changing, host, layout, actions, textbox, settings };
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
      args.fire({
        type: 'dev:action/Textbox',
        payload: { namespace, item, action: 'init' },
      });
    }
  },
};
