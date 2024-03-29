import { useEffect } from 'react';
import { takeUntil } from 'rxjs/operators';

import { PeerNetwork, t } from '../DEV.common';
import * as layouts from './DEV.useGroupController.layouts';

export function useGroupController(args: { bus: t.EventBus<any>; netbus: t.PeerNetbus<any> }) {
  const bus = args.bus as t.EventBus<t.DevEvent>;
  const netbus = args.netbus as t.PeerNetbus<t.DevEvent>;

  useEffect(() => {
    const local = PeerNetwork.PeerEvents(bus);
    const network$ = netbus.$.pipe(takeUntil(local.dispose$));

    /**
     * Initialize controller logic.
     */
    layouts.listen({ bus, netbus, network$ });

    return () => local.dispose();
  }, []); // eslint-disable-line

  return {};
}
