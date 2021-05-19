import React, { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DevVideoFullscreen } from '../media';

import { rx, t, StateObject } from '../common';

export function useLocalController(args: { bus: t.EventBus<any> }) {
  const bus = args.bus as t.EventBus<t.DevEvent>;

  const [modal, setModal] = useState<t.DevModal | undefined>();
  const [model, setModel] = useState<t.DevModelState | undefined>();

  useEffect(() => {
    const dispose$ = new Subject<void>();
    const $ = bus.$.pipe(takeUntil(dispose$));

    const initial: t.DevModel = { group: { screens: {} } };
    const model = StateObject.create<t.DevModel>(initial) as t.DevModelState;
    setModel(model);

    /**
     * State model.
     */
    rx.payload<t.DevModelGetReqEvent>($, 'DEV/model/get:req')
      .pipe()
      .subscribe((e) => {
        bus.fire({
          type: 'DEV/model/get:res',
          payload: { tx: e.tx, model },
        });
      });

    model.event.changed$.pipe(takeUntil(dispose$)).subscribe((e) => {
      // TODO 🐷
      console.log('MODEL changed', e);
      console.log('e.to', e.to);
      bus.fire({
        type: 'DEV/model/changed',
        payload: { state: e.to },
      });
    });

    /**
     * Modal View
     */
    rx.payload<t.DevModalEvent>($, 'DEV/modal')
      .pipe()
      .subscribe((e) => setModal(e));

    rx.payload<t.DevMediaModalEvent>($, 'DEV/media/modal')
      .pipe()
      .subscribe((e) => {
        const { target, isSelf, isRecordable } = e;
        const el = (
          <DevVideoFullscreen
            bus={bus}
            stream={e.stream}
            isSelf={isSelf}
            isRecordable={isRecordable}
          />
        );
        bus.fire({ type: 'DEV/modal', payload: { el, target } });
      });

    return () => dispose$.next();
  }, []); // eslint-disable-line

  return { modal, model };
}
