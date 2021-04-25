import React, { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DevVideoFullscreen } from './media';

import { rx, t } from './common';

export function useDevState(args: { bus: t.EventBus<any> }) {
  const bus = args.bus.type<t.DevEvent>();
  const [modal, setModal] = useState<t.DevModal | undefined>();

  useEffect(() => {
    const dispose$ = new Subject<void>();
    const $ = bus.event$.pipe(takeUntil(dispose$));

    rx.payload<t.DevModalEvent>($, 'DEV/modal')
      .pipe()
      .subscribe((e) => setModal(e));

    rx.payload<t.DevMediaModalEvent>($, 'DEV/media/modal')
      .pipe()
      .subscribe((e) => {
        const { target } = e;
        const el = <DevVideoFullscreen bus={bus} stream={e.stream} />;
        bus.fire({ type: 'DEV/modal', payload: { el, target } });
      });

    return () => dispose$.next();
  }, []); // eslint-disable-line

  return { modal };
}
