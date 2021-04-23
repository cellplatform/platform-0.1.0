import React, { useEffect, useState } from 'react';
import { map } from 'rxjs/operators';

import { css, CssValue, PeerNetwork, t } from '../common';
import { DevConnection, DevDataConnections } from '../Connection';

export type DevNetworkConnectionsProps = {
  self: t.PeerId;
  bus: t.EventBus<any>;
  netbus: t.EventBus<any>;
  collapseData?: boolean;
  filter?: (connection: t.PeerConnectionStatus) => boolean;
  paddingTop?: number;
  style?: CssValue;
};

export const DevNetworkConnections: React.FC<DevNetworkConnectionsProps> = (props) => {
  const { self, netbus, collapseData } = props;
  const bus = props.bus.type<t.PeerEvent>();

  const [connections, setConnections] = useState<t.PeerConnectionStatus[]>([]);
  const data = connections.filter((e) => e.kind === 'data') as t.PeerConnectionDataStatus[];
  const media = connections.filter((e) => e.kind !== 'data') as t.PeerConnectionMediaStatus[];

  useEffect(() => {
    const events = PeerNetwork.Events({ bus });
    const status$ = events.status(self).changed$.pipe(map((e) => e.peer));

    const updateConnections = async (peer?: t.PeerStatus) => {
      if (!peer) peer = (await events.status(self).get()).peer;
      const conn = (peer?.connections || []).filter(props.filter ? props.filter : () => true);
      setConnections(conn);
    };

    status$.subscribe((peer) => updateConnections(peer));
    updateConnections();

    return () => events.dispose();
  }, [bus, self]); // eslint-disable-line

  const PADDING = { CARD: 25 };

  const styles = {
    base: css({ Absolute: 0, boxSizing: 'border-box' }),
    scroll: css({
      Absolute: 0,
      Scroll: true,
      display: 'flex',
      flexWrap: 'wrap',
      paddingTop: props.paddingTop,
      paddingBottom: 80,
      paddingRight: PADDING.CARD,
    }),
  };

  const toConnection = (item: t.PeerConnectionStatus) => {
    return (
      <DevConnection
        self={self}
        key={item.uri}
        bus={bus}
        netbus={netbus}
        connection={item}
        margin={[PADDING.CARD, 0, 0, PADDING.CARD]}
      />
    );
  };

  const elDataSingle = collapseData && data.length === 1 && toConnection(data[0]);
  const elDataStack = collapseData && data.length > 1 && (
    <DevDataConnections
      self={self}
      bus={bus}
      netbus={netbus}
      connections={data}
      margin={[PADDING.CARD, 0, 0, PADDING.CARD]}
    />
  );
  const elDataAll = !collapseData && data.map(toConnection);

  const elMedia = media.map(toConnection);

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.scroll}>
        {elDataSingle}
        {elDataStack}
        {elDataAll}
        {elMedia}
      </div>
    </div>
  );
};
