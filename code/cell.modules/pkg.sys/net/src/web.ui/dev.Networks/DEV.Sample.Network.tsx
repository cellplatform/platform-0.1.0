import React from 'react';
import { ObjectView } from 'sys.ui.dev';

import {
  css,
  CssValue,
  t,
  useLocalPeer,
  LocalPeerCard,
  Card,
  BulletList,
  color,
} from './DEV.common';

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

  const peers = status?.connections.map((conn) => {
    return conn;
  });

  /**
   * [Render]
   */
  const styles = {
    base: css({
      minWidth: 480,
      minHeight: 200,
      padding: 15,
      Flex: 'horizontal-start-start',
      marginBottom: 20,
      ':last-child': { marginBottom: 0 },
    }),
    peerProps: { base: css({ marginRight: 15 }) },
    peers: {
      base: css({ marginRight: 15 }),
    },
  };

  const elPeers = (
    <BulletList.Layout
      orientation={'y'}
      bullet={{ edge: 'near', size: 20 }}
      spacing={20}
      items={peers?.map((data) => ({ data }))}
      renderers={{
        bullet: (e) => {
          return <BulletList.Renderers.Bullet.ConnectorLines {...e} radius={15} lineWidth={3} />;
        },
        body: (e) => {
          if (e.kind !== 'Default') return;
          return <BulletList.Renderers.Body.Default {...e} expandPaths={[]} />;
        },
      }}
    />
  );

  return (
    <Card style={css(styles.base, props.style)}>
      <div {...styles.peerProps.base}>
        {status && <LocalPeerCard bus={bus} self={{ id: self, status }} newConnections={true} />}
      </div>
      <div {...styles.peers.base}>{elPeers}</div>
      <div>
        <ObjectView name={'peer'} data={peer} fontSize={10} />
      </div>
    </Card>
  );
};
