import { firstValueFrom, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { rx, slug, t } from '../common';

export function DevEvents(eventbus: t.EventBus<any>) {
  const dispose$ = new Subject<void>();
  const bus = eventbus.type<t.DevEvent>();
  const $ = bus.event$.pipe(takeUntil(dispose$));

  const model = {
    req$: rx.payload<t.DevModelGetReqEvent>($, 'DEV/model/get:req'),
    res$: rx.payload<t.DevModelGetResEvent>($, 'DEV/model/get:res'),
    changed$: rx.payload<t.DevModelChangedEvent>($, 'DEV/model/changed'),

    async get() {
      const tx = slug();
      const res = firstValueFrom(model.res$.pipe(filter((e) => e.tx === tx)));
      bus.fire({ type: 'DEV/model/get:req', payload: { tx } });
      return (await res).model;
    },
  };

  return {
    $,
    dispose$: dispose$.asObservable(),
    dispose: () => dispose$.next(),
    model,
  };
}
