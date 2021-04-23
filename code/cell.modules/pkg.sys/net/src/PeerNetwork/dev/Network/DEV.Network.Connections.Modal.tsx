import React, { useEffect, useRef, useState } from 'react';
import { filter, map } from 'rxjs/operators';

import { PeerNetwork, t, css, color } from '../common';
import { DevModal } from '../DEV.Modal';
import { DevNetworkConnections, DevNetworkConnectionsProps } from './DEV.Network.Connections';

export type DevNetworkConnectionsModalProps = {
  self: t.PeerId;
  bus: t.EventBus<any>;
  netbus: t.EventBus<any>;
  filter?: DevNetworkConnectionsProps['filter'];
};

export const DevNetworkConnectionsModal: React.FC<DevNetworkConnectionsModalProps> = (props) => {
  const { netbus, self } = props;
  const bus = props.bus.type<t.DevEvent>();

  useEffect(() => {
    const events = PeerNetwork.Events({ bus });
    const status$ = events.status(self).changed$.pipe(map((e) => e.peer));

    // Remove modal when all connections have been closed.
    status$.pipe(filter((e) => e.connections.length === 0)).subscribe((e) => {
      bus.fire({ type: 'DEV/modal', payload: { el: undefined } });
    });

    return () => events.dispose();
  }, [bus, self]);

  const headerHeight = 44;

  const styles = {
    header: css({
      boxSizing: 'border-box',
      Absolute: [0, 10, null, 0],
      backgroundColor: color.format(0.8),
      backdropFilter: `blur(5px)`,
      height: headerHeight,
      padding: 14,
      fontSize: 16,
    }),
  };

  return (
    <DevModal bus={bus} background={1}>
      <DevNetworkConnections
        self={self}
        bus={bus}
        netbus={netbus}
        collapseData={false}
        filter={props.filter}
        paddingTop={headerHeight}
      />
      <div {...styles.header}>Data Connections</div>
    </DevModal>
  );
};
