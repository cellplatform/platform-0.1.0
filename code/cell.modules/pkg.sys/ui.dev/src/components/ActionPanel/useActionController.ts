import { useEffect } from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { withinContext } from '../../api/actions';
import { rx, t } from '../../common';

type O = Record<string, unknown>;

/**
 * Controller for handling actions.
 */
export function useActionController(args: { bus: t.DevEventBus; model: t.DevActionModelState<O> }) {
  const { bus, model } = args;

  useEffect(() => {
    const dispose$ = new Subject<void>();
    const $ = bus.event$.pipe(takeUntil(dispose$));

    const runWithinContext = (handler: (ctx: O) => void) => {
      const res = withinContext(model, handler);
      if (res.changed) {
        const { from, to, patches } = res.changed;
        bus.fire({
          type: 'Dev/Action/ctx:changed',
          payload: { actions: model.state.id, from, to, patches },
        });
      }
    };

    rx.payload<t.IDevActionButtonClickEvent>($, 'Dev/Action/button:click')
      .pipe()
      .subscribe((e) => {
        const { onClick } = e.model;
        if (onClick) runWithinContext((ctx) => onClick(ctx));
      });

    return () => dispose$.next();
  }, [bus, model]);
}
