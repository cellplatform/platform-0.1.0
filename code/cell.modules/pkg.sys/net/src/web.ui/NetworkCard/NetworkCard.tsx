import React from 'react';

import { CardBody } from '../primitives';
import { Card, css, CssValue, t, useLocalPeer, rx } from './common';
import { NetworkCardBody } from './components/Body';
import { NetworkCardChild } from './components/Child';
import { NetworkCardFooter } from './components/Footer';
import { NetworkCardTitlebar } from './components/Titlebar';

export type NetworkCardProps = {
  instance: t.InstanceId;
  network: t.PeerNetwork;
  child?: JSX.Element;
  style?: CssValue;
};

export const NetworkCard: React.FC<NetworkCardProps> = (props) => {
  const { network, child, instance } = props;
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

  const elRootCard = (
    <Card style={styles.rootCard}>
      <CardBody header={elHeader}>
        <NetworkCardBody
          instance={instance}
          self={self}
          network={network}
          peers={peers}
          style={styles.fill}
        />
        <NetworkCardFooter network={network} />
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
