import { useEffect } from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { Context, Handler } from '../api/Actions';
import { R, rx, t, time } from '../common';

/**
 * Controller for handling actions.
 */
export function useActionPanelController(args: { bus: t.EventBus; actions: t.Actions }) {
  const { actions } = args;
  const namespace = actions.toObject().namespace;
  const defs = actions.toDefs();

  useEffect(() => {
    const model = actions.toModel();
    const dispose$ = new Subject<void>();
    const bus = args.bus as t.EventBus<t.ActionEvent>;
    const event$ = bus.$.pipe(
      takeUntil(dispose$),
      filter((e) => e.payload.namespace === namespace),
    );

    /**
     * Helpers that operate on the model within the context of this closure.
     */
    const Model = {
      change(fn: (draft: t.ActionsModel<any>) => void) {
        Context.getAndStore(model, { throw: true }); // NB: This will also assign the [ctx.current] value.
        return model.change(fn);
      },
      payload<T extends t.ActionItem>(itemId: string, draft: t.ActionsModel<any>) {
        const ctx = draft.ctx.current;
        const env = draft.env.viaAction;
        const { host, layout } = Handler.params.action({ ctx, env });
        const item = draft.items.find((item) => item.id === itemId) as T;
        return { ctx, host, item, layout, env };
      },
      find(id: string | number) {
        const items = model.state.items;
        const index = typeof id === 'number' ? id : items.findIndex((item) => item.id === id);
        const item = items[index];
        return { index, item };
      },
    };

    /**
     * INITIALIZE
     *    Setup the initial model state by invoking
     *    each value producing handler.
     */
    rx.payload<t.IActionsInitEvent>(event$, 'sys.ui.dev/actions/init')
      .pipe()
      .subscribe((e) => {
        // Run initializer on each item.
        model.state.items.forEach((item) => {
          const { id, kind } = item;
          const def = defs.find((def) => def.kind === kind);
          if (typeof def?.listen === 'function') {
            def.listen({
              id,
              actions: actions.toModel(),
              fire: args.bus.fire,
              event$,
            });
          }
        });

        // Finish up.
        model.change((draft) => (draft.initialized = true));
      });

    /**
     * Monitor for changes to individual item models and alert listeners.
     * This looks for patch changes to the path:
     *
     *    "item/<index>"
     *
     */
    model.event.changed$
      .pipe(
        filter((e) => e.op === 'update'),
        map((e) => e.patches.next.filter((p) => p.path.match(/^items\/\d+\//))),
        filter((patches) => patches.length > 0),
        map((patches) => patches.map((patch) => patch.path)),
        map((paths) => paths.map((path) => path.replace(/^items\//, ''))),
        map((paths) => paths.map((path) => parseInt(path.substring(0, path.indexOf('/'))))),
        map((indexes) => R.uniq(indexes)),
      )
      .subscribe((indexes) => {
        indexes.forEach((index) => {
          const model = Model.find(index).item;
          if (model) {
            bus.fire({
              type: 'sys.ui.dev/action/model/changed',
              payload: { namespace, index, item: model },
            });
          }
        });
      });

    /**
     * INITIALIZE: Setup initial state.
     * NOTE:
     *    Delaying for a tick allows all interested  components to setup
     *    their hooks before the initial state configuration is established.
     */
    time.delay(0, () => bus.fire({ type: 'sys.ui.dev/actions/init', payload: { namespace } }));

    return () => dispose$.next();
  }, [args.bus, actions, namespace, defs]);
}
