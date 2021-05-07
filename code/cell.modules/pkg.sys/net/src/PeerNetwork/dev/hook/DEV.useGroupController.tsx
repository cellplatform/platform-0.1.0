import React, { useEffect, useState } from 'react';
import { takeUntil } from 'rxjs/operators';

import { PeerNetwork, t } from '../common';
import * as layouts from './DEV.useGroupController.layouts';

export function useGroupController(args: { bus: t.EventBus<any>; netbus: t.NetBus<any> }) {
  const bus = args.bus.type<t.DevEvent>();
  const netbus = args.netbus.type<t.DevEvent>();

  useEffect(() => {
    const local = PeerNetwork.Events(bus);
    const network$ = netbus.event$.pipe(takeUntil(local.dispose$));

    /**
     * Initialize controller logic.
     */
    layouts.listen({ bus, netbus, network$ });

    return () => local.dispose();
  }, []); // eslint-disable-line

  return {};
}
