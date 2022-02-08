import React from 'react';

import { Card, css, CssValue, t, useLocalPeer } from './DEV.common';
import { DevNetworkBody } from './DEV.Network.Body';
import { DevNetworkFooter } from './DEV.Network.Footer';
import { DevNetworkTitlebar } from './DEV.Network.Titlebar';
import { DevChildCard } from './DEV.Network.ChildCard';

export type DevNetworkProps = {
  network: t.PeerNetwork;
  style?: CssValue;
};

export const DevNetwork: React.FC<DevNetworkProps> = (props) => {
  const { network } = props;
  const { bus } = network;
  const self = network.netbus.self;

  const peer = useLocalPeer({ self, bus });
  const status = peer.status;
  const peers = status?.connections || [];

  /**
   * [Render]
   */
  const styles = {
    base: css({
      boxSizing: 'border-box',
      Flex: 'x-stretch-stretch',
    }),
    card: {
      root: css({
        minWidth: 600,
        minHeight: 300,
        Flex: 'y-stretch-stretch',
      }),
    },
  };

  return (
    <div {...css(styles.base, props.style)}>
      <Card style={styles.card.root}>
        <DevNetworkTitlebar bus={bus} self={self} />
        <DevNetworkBody bus={bus} self={self} peers={peers} status={status} style={{ flex: 1 }} />
        <DevNetworkFooter bus={bus} self={self} />
      </Card>
      <DevChildCard bus={bus} netbus={network.netbus} />
    </div>
  );
};
