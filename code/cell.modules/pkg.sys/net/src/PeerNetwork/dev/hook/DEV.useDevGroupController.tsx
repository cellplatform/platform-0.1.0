import React, { useEffect, useState } from 'react';
import { filter, takeUntil } from 'rxjs/operators';

import { PeerNetwork, rx, t } from '../common';
import { DevVideosLayout } from '../media';
import { DevCrdtModel, DevScreensize } from '../layouts';

export function useDevGroupController(args: { bus: t.EventBus<any>; netbus: t.NetBus<any> }) {
  const bus = args.bus.type<t.DevEvent>();
  const netbus = args.netbus.type<t.DevEvent>();
  const self = netbus.self;

  useEffect(() => {
    const local = PeerNetwork.Events(bus);
    const netbus$ = netbus.event$.pipe(takeUntil(local.dispose$));
    const layout$ = rx.payload<t.DevGroupLayoutEvent>(netbus$, 'DEV/group/layout');

    /**
     * Handle group layout requests.
     */
    const layout = (kind: t.DevGroupLayout['kind'], factory?: () => JSX.Element) => {
      layout$.pipe(filter((e) => e.kind === kind)).subscribe((e) => {
        const el = factory ? factory() : undefined;
        const target = e.target ?? 'fullscreen';
        bus.fire({ type: 'DEV/modal', payload: { el, target } });
      });
    };

    layout('cards'); // NB: Clear
    layout('videos', () => <DevVideosLayout bus={bus} netbus={netbus} />);
    layout('crdt', () => <DevCrdtModel bus={bus} netbus={netbus} />);
    layout('screensize', () => <DevScreensize bus={bus} netbus={netbus} />);

    return () => {
      local.dispose();
    };
  }, []); // eslint-disable-line

  return {};
}
