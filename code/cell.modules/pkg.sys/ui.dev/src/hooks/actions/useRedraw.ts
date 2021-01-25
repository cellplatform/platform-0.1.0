import { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { t } from '../../common';

/**
 * Causes a redraw of a component when the state of the Action model changes.
 */
export function useRedraw(args: { bus: t.DevEventBus; actions: t.DevActions<any> }) {
  const { bus, actions } = args;
  const [redraw, setRedraw] = useState<number>(0);

  useEffect(() => {
    const model = actions.toModel();
    const dispose$ = new Subject<void>();
    const ns = model.state.ns;
    const changed$ = model.event.changed$;

    changed$
      .pipe(
        takeUntil(dispose$),
        filter((e) => e.action === 'Dev/Action/ctx'),
        filter((e) => e.to.ns === ns),
      )
      .subscribe((e) => {
        try {
          setRedraw((prev) => prev + 1);
        } catch (error) {
          console.log('error', error);
          throw error;
        }
      });

    return () => dispose$.next();
  }, [bus, actions]); // eslint-disable-line
}
