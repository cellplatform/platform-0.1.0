import React from 'react';

import { Card, css, CssValue, t, useLocalPeer } from './DEV.common';
import { DevSampleNetworkBody } from './DEV.Network.Body';
import { DevSampleNetworkFooter } from './DEV.Network.Footer';
import { DevSampleNetworkTitlebar } from './DEV.Network.Titlebar';

export type DevSampleNetworkProps = {
  network: t.PeerNetwork;
  style?: CssValue;
};

export const DevSampleNetwork: React.FC<DevSampleNetworkProps> = (props) => {
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
      Flex: 'y-stretch-stretch',
      boxSizing: 'border-box',
      minWidth: 600,
      minHeight: 230,
    }),
  };

  return (
    <Card style={css(styles.base, props.style)}>
      <DevSampleNetworkTitlebar bus={bus} self={self} />
      <DevSampleNetworkBody
        bus={bus}
        self={self}
        peers={peers}
        status={status}
        style={{ flex: 1 }}
      />
      <DevSampleNetworkFooter bus={bus} self={self} />
    </Card>
  );
};
