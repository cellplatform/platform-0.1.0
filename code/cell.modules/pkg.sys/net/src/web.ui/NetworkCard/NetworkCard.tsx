import React from 'react';

import { CardBody } from '../primitives';
import { Card, css, CssValue, t, useLocalPeer } from './common';
import { NetworkCardBody } from './components/Body';
import { NetworkCardChild } from './components/Child';
import { NetworkCardFooter } from './components/Footer';
import { NetworkCardTitlebar } from './components/Titlebar';

export type NetworkCardProps = {
  network: t.PeerNetwork;
  child?: JSX.Element;
  style?: CssValue;
};

export const NetworkCard: React.FC<NetworkCardProps> = (props) => {
  const { network, child } = props;
  const { bus, netbus } = network;
  const self = netbus.self;

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
    rootCard: css({
      minWidth: 600,
      minHeight: 300,
      display: 'flex',
    }),
    fill: css({ flex: 1 }),
  };

  const elHeader = <NetworkCardTitlebar bus={bus} self={self} />;

  const elRootCard = (
    <Card style={styles.rootCard}>
      <CardBody header={elHeader}>
        <NetworkCardBody self={self} bus={bus} peers={peers} status={status} style={styles.fill} />
        <NetworkCardFooter self={self} bus={bus} netbus={netbus} />
      </CardBody>
    </Card>
  );

  const elChild = child && <NetworkCardChild>{child}</NetworkCardChild>;

  return (
    <div {...css(styles.base, props.style)}>
      {elRootCard}
      {elChild}
    </div>
  );
};