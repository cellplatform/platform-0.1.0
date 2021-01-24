import { useEffect } from 'react';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

import { withinContext } from '../../api/actions';
import { rx, t } from '../../common';

type O = Record<string, unknown>;

/**
 * Controller for handling actions.
 */
export function useActionPanelController(args: {
  bus: t.DevEventBus;
  model: t.DevActionModelState<O>;
}) {
  const { bus, model } = args;

  useEffect(() => {
    const ns = model.state.ns;
    const dispose$ = new Subject<void>();
    const $ = bus.event$.pipe(
      takeUntil(dispose$),
      filter((e) => e.payload.ns === ns),
    );

    /**
     * Button
     */
    rx.payload<t.IDevActionButtonEvent>($, 'Dev/Action/button')
      .pipe()
      .subscribe((e) => {
        const { handler } = e.model;
        if (handler) {
          const env: t.DevEnv = { ns };
          withinContext(bus, model, env, (ctx, env) => handler(ctx, env)).fireIfChanged();
        }
      });

    /**
     * Boolean (Switch)
     */
    rx.payload<t.IDevActionBooleanEvent>($, 'Dev/Action/boolean')
      .pipe()
      .subscribe((e) => {
        const change = e.change;
        const { handler } = e.model;
        if (handler) {
          const env: t.DevEnvBoolean = { ns, change };
          let result = false;
          withinContext(
            bus,
            model,
            env,
            (ctx, env) => (result = handler(ctx, env)),
          ).fireIfChanged();
          e.current(result);
        }
      });

    return () => dispose$.next();
  }, [bus, model]);
}
