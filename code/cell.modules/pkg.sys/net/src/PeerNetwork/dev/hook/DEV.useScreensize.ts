import React, { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { rx, t, useResizeObserver } from '../common';

/**
 * Nonitor screensize events.
 */
export function useDevScreensize(args: {
  ref: React.RefObject<HTMLElement>;
  bus: t.EventBus<any>;
  netbus: t.NetBus<any>;
}) {
  const bus = args.bus.type<t.DevEvent>();
  const netbus = args.netbus.type<t.DevEvent>();
  const source = netbus.self;

  const resize = useResizeObserver(args.ref);

  //
  useEffect(() => {
    const dispose$ = new Subject<void>();
    const netbus$ = netbus.event$.pipe(takeUntil(dispose$));
    const resize$ = resize.$.pipe(takeUntil(dispose$));

    /**
     * Alert other peers when screen size changes.
     */
    resize$.pipe().subscribe((e) => {
      const { width, height } = resize.rect;
      netbus.target.remote({
        type: 'DEV/layout/size',
        payload: { source, kind: 'root', size: { width, height } },
      });
    });

    /**
     * Listen for screen size changes from other peers.
     */
    rx.payload<t.DevLayoutSizeEvent>(netbus$, 'DEV/layout/size')
      .pipe(filter((e) => e.source !== source))
      .subscribe((e) => {
        console.log('peer - resized', e);
      });

    //
    return () => {
      dispose$.next();
    };
  }, []); // eslint-disable-line
}
