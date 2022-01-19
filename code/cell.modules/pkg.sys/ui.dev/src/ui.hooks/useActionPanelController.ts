import { useEffect } from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { Context } from '../api/Actions';
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
      /**
       * Find an action item with the given ID.
       */
      find(id: string | number) {
        const items = model.state.items;
        const index = typeof id === 'number' ? id : items.findIndex((item) => item.id === id);
        const item = items[index];
        return { index, item };
      },
      initialize: {
        /**
         * Run the initializer on each item.
         */
        eachItem() {
          model.state.items.forEach((item) => {
            const { id, kind } = item;
            const def = defs.find((def) => def.kind === kind);
            const bus = args.bus;
            if (typeof def?.listen === 'function') {
              def.listen({ id, actions: model, bus });
            }
          });
        },

        /**
         * Run the `.init()` handler of the Actions set.
         */
        async handler() {
          const fn = model.state.init;
          if (!fn) return;

          // NB: This will also assign the [ctx.current] value.
          Context.getAndStore(model, { throw: true });

          // Prepare the bus to be provided to the init function.
          const namespace = model.state.namespace;
          const bus = rx.bus();
          const unloaded$ = rx
            .payload<t.ActionsDisposeEvent>(event$, 'sys.ui.dev/actions/dispose')
            .pipe(filter((e) => e.namespace === namespace));

          args.bus.$.pipe(
            takeUntil(dispose$),
            takeUntil(unloaded$),
            filter((e) => !e.type.startsWith('sys.ui.dev/')), // NB: we know the internal events for the harness aren't relevant.
          ).subscribe(bus.fire);

          // Invoke the init function
          await model.changeAsync(async (draft) => {
            const ctx = draft.ctx.current;
            await fn({ bus, ctx });
          });
        },
      },
    };

    /**
     * INITIALIZE
     *    Setup the initial model state by invoking
     *    each value producing handler.
     */
    rx.payload<t.ActionsInitEvent>(event$, 'sys.ui.dev/actions/init')
      .pipe()
      .subscribe(async (e) => {
        await Model.initialize.handler();
        Model.initialize.eachItem();
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
          const item = Model.find(index).item;
          if (item) {
            bus.fire({
              type: 'sys.ui.dev/action/model/changed',
              payload: { namespace, index, item },
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
