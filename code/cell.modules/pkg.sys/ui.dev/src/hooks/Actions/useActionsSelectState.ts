import { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { rx, t } from '../../common';

/**
 * Managest the state of a <Select> dropdown of a set of actions.
 */
export function useActionsSelectState(args: {
  bus: t.EventBus;
  actions: t.DevActions[];
  store: t.ActionsSelectStore;
}) {
  const list = args.actions;
  const bus = args.bus?.type<t.DevEvent>();
  const [selected, setSelected] = useState<t.DevActions>();

  useEffect(() => {
    const dispose$ = new Subject<void>();
    const $ = bus.event$.pipe(takeUntil(dispose$));

    if (!selected) args.store().then((e) => setSelected(e || list[0])); // Initial state.

    rx.payload<t.IDevActionsSelectChangedEvent>($, 'dev:actions/select/changed')
      .pipe()
      .subscribe((e) => {
        const current = list.find((actions) => actions.toObject().namespace === e.namespace);
        setSelected(current);
        args.store(current);
      });

    return () => dispose$.next();
  }, [bus, list]); // eslint-disable-line

  return { list, selected };
}
