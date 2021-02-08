import { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';

import { R, rx, t, Events } from '../../common';

/**
 * Updates an item model (state) when changes are reported
 * through the event-bus.
 */
export function useItemMonitor<M extends t.DevActionItem>(args: {
  bus: t.DevEventBus;
  model: M;
}): M {
  const { bus } = args;
  const [model, setModel] = useState<M>();

  useEffect(() => {
    const dispose$ = new Subject<void>();
    const $ = bus.event$.pipe(
      takeUntil(dispose$),
      filter((e) => Events.isActionEvent(e)),
    );

    rx.payload<t.IDevActionModelChangedEvent>($, 'dev:action/model/changed')
      .pipe(
        filter((e) => e.model.id === args.model.id),
        distinctUntilChanged((prev, next) => R.equals(prev, next)),
      )
      .subscribe((e) => {
        setModel(e.model as M);
      });

    return () => dispose$.next();
  }, []); // eslint-disable-line

  return model || args.model;
}
