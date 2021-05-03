import React, { useEffect, useState } from 'react';
import { filter, takeUntil } from 'rxjs/operators';

import { PeerNetwork, rx, t } from './common';
import { DevVideosLayout } from './media';

export function useDevGroupController(args: { bus: t.EventBus<any>; netbus: t.NetBus<any> }) {
  const bus = args.bus.type<t.DevEvent>();
  const netbus = args.netbus.type<t.DevEvent>();
  const self = netbus.self;

  useEffect(() => {
    const local = PeerNetwork.Events(bus);
    const netbus$ = netbus.event$.pipe(takeUntil(local.dispose$));
    const layout$ = rx.payload<t.DevGroupLayoutEvent>(netbus$, 'DEV/group/layout');

    /**
     * Default layout (cards).
     */
    layout$.pipe(filter((e) => e.kind === 'cards')).subscribe((e) => {
      bus.fire({ type: 'DEV/modal', payload: {} });
    });

    /**
     * Physics video layout.
     */
    layout$.pipe(filter((e) => e.kind === 'videos')).subscribe((e) => {
      const el = <DevVideosLayout bus={bus} netbus={netbus} />;
      bus.fire({ type: 'DEV/modal', payload: { el, target: 'fullscreen' } });
    });

    return () => {
      local.dispose();
    };
  }, []); // eslint-disable-line

  return {};
}
