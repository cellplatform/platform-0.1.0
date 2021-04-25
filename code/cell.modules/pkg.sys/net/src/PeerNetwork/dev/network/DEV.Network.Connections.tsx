import React, { useEffect, useState } from 'react';
import { map } from 'rxjs/operators';

import { css, CssValue, defaultValue, PeerNetwork, t } from '../common';
import {
  DevConnection,
  DevConnections,
  DevDataConnections,
  DevMediaConnections,
} from '../connection';
import { DevEventBusCard } from '../event';

export type DevNetworkConnectionsProps = {
  self: t.PeerId;
  bus: t.EventBus<any>;
  netbus: t.NetBus<any>;
  collapse?: boolean | { data?: boolean; media?: boolean };
  showNetbus?: boolean;
  filter?: (connection: t.PeerConnectionStatus) => boolean;
  paddingTop?: number;
  style?: CssValue;
};

export const DevNetworkConnections: React.FC<DevNetworkConnectionsProps> = (props) => {
  const { self, netbus } = props;
  const bus = props.bus.type<t.PeerEvent>();
  const collapse = {
    data:
      typeof props.collapse === 'boolean'
        ? props.collapse
        : defaultValue(props.collapse?.data, true),
    media:
      typeof props.collapse === 'boolean'
        ? props.collapse
        : defaultValue(props.collapse?.media, true),
  };

  const [connections, setConnections] = useState<t.PeerConnectionStatus[]>([]);
  const data = connections.filter((e) => e.kind === 'data') as t.PeerConnectionDataStatus[];
  const media = connections.filter((e) => e.kind !== 'data') as t.PeerConnectionMediaStatus[];

  useEffect(() => {
    const events = PeerNetwork.Events(bus);
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

  const renderCard = <T extends t.PeerConnectionStatus>(
    collapse: boolean,
    items: T[],
    stackBody: (items: T[]) => JSX.Element,
  ) => {
    if (!collapse) return items.map(toConnection);
    if (items.length < 1) return null;
    if (items.length === 1) return toConnection(items[0]);
    return (
      <DevConnections bus={bus} connections={items} margin={[PADDING.CARD, 0, 0, PADDING.CARD]}>
        {stackBody(items)}
      </DevConnections>
    );
  };

  const elData = renderCard(collapse.data, data, (items) => (
    <DevDataConnections self={self} bus={bus} netbus={netbus} connections={items} />
  ));

  const elMedia = renderCard(collapse.media, media, (items) => (
    <DevMediaConnections self={self} bus={bus} netbus={netbus} connections={items} />
  ));

  const elNetbus = props.showNetbus && (
    <DevEventBusCard self={self} bus={bus} margin={[PADDING.CARD, 0, 0, PADDING.CARD]} />
  );

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.scroll}>
        {elNetbus}
        {elData}
        {elMedia}
      </div>
    </div>
  );
};
