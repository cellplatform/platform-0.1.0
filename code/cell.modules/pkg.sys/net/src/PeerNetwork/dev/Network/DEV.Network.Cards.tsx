import React from 'react';

import { css, CssValue, t } from '../common';
import { DevConnection } from '../Connection';
import { DevDataConnections } from '../Connection';

export type DevNetworkCardsProps = {
  bus: t.EventBus<any>;
  netbus: t.EventBus<any>;
  peer: t.PeerStatus;
  style?: CssValue;
};

export const DevNetworkCards: React.FC<DevNetworkCardsProps> = (props) => {
  const { peer, netbus } = props;
  const bus = props.bus.type<t.PeerEvent>();

  const connections = {
    data: peer.connections.filter((e) => e.kind === 'data') as t.PeerConnectionDataStatus[],
    media: peer.connections.filter((e) => e.kind !== 'data') as t.PeerConnectionMediaStatus[],
  };

  const PADDING = { CARD: 25 };

  const styles = {
    base: css({ Absolute: 0 }),
    scroll: css({
      Absolute: 0,
      Scroll: true,
      display: 'flex',
      flexWrap: 'wrap',
      paddingBottom: 80,
      paddingRight: PADDING.CARD,
    }),
  };

  const toConnection = (item: t.PeerConnectionStatus) => {
    return (
      <DevConnection
        key={item.uri}
        bus={bus}
        netbus={netbus}
        connection={item}
        margin={[PADDING.CARD, 0, 0, PADDING.CARD]}
      />
    );
  };

  const elDataConnection = connections.data.length === 1 && toConnection(connections.data[0]);
  const elDataConnections = connections.data.length > 1 && (
    <DevDataConnections
      bus={bus}
      netbus={netbus}
      connections={connections.data}
      margin={[PADDING.CARD, 0, 0, PADDING.CARD]}
    />
  );

  const elMediaConnections = connections.media.map(toConnection);

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.scroll}>
        {elDataConnection}
        {elDataConnections}
        {elMediaConnections}
      </div>
    </div>
  );
};
