import React from 'react';

import { NetbusCard } from '../NetbusCard';
import { CardBody } from '../primitives';
import { Card, css, CssValue, t, useLocalPeer } from './common';
import { NetworkCardBody } from './components/Body';
import { NetworkCardChild } from './components/Child';
import { NetworkCardFooter } from './components/Footer';
import { NetworkCardTitlebar } from './components/Titlebar';

export type NetworkCardProps = {
  network: t.PeerNetwork;
  style?: CssValue;
};

export const NetworkCard: React.FC<NetworkCardProps> = (props) => {
  const { network } = props;
  const { bus, netbus } = network;
  const self = netbus.self;

  const peer = useLocalPeer({ self, bus });
  const status = peer.status;
  const peers = status?.connections || [];

  /**
   * [Render]
   */
  const styles = {
    base: css({ boxSizing: 'border-box', Flex: 'x-stretch-stretch' }),
    rootCard: css({
      minWidth: 600,
      minHeight: 300,
      display: 'flex',
    }),
    fill: css({ flex: 1 }),
  };

  const elHeader = <NetworkCardTitlebar bus={bus} self={self} />;

  /**
   * TODO 🐷
   * - determine content based on root card's selection state.
   */
  const elTMP = <NetbusCard netbus={netbus} style={styles.fill} />;

  const elRootCard = (
    <Card style={styles.rootCard}>
      <CardBody header={elHeader}>
        <NetworkCardBody bus={bus} self={self} peers={peers} status={status} style={styles.fill} />
        <NetworkCardFooter bus={bus} self={self} />
      </CardBody>
    </Card>
  );

  const elChild = <NetworkCardChild>{elTMP}</NetworkCardChild>;

  return (
    <div {...css(styles.base, props.style)}>
      {elRootCard}
      {elChild}
    </div>
  );
};
