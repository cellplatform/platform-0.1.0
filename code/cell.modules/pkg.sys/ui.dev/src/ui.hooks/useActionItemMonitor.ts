import { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';

import { R, rx, t } from '../common';

/**
 * Updates an item model (state) when changes are reported
 * through the event-bus.
 */
export function useActionItemMonitor<M extends t.ActionItem>(args: {
  bus: t.EventBus;
  item: M;
}): M {
  const bus = args.bus as t.EventBus<t.ActionEvent>;
  const [item, setItem] = useState<M>();

  useEffect(() => {
    const dispose$ = new Subject<void>();
    const $ = bus.$.pipe(takeUntil(dispose$));

    rx.payload<t.ActionModelChangedEvent>($, 'sys.ui.dev/action/model/changed')
      .pipe(
        filter((e) => e.item.id === args.item.id),
        distinctUntilChanged((prev, next) => R.equals(prev, next)),
      )
      .subscribe((e) => {
        setItem(e.item as M);
      });

    return () => dispose$.next();
  }, []); // eslint-disable-line

  return item || args.item;
}
