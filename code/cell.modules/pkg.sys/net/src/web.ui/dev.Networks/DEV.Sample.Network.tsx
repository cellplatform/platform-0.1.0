import React from 'react';

import {
  BulletList,
  Card,
  color,
  css,
  CssValue,
  LocalPeerCard,
  t,
  useLocalPeer,
} from './DEV.common';
import { PeerLabel } from './DEV.PeerLabel';
import { DevSampleNetworkTitlebar } from './DEV.Sample.Network.Titlebar';

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
  const hasPeers = peers.length > 0;

  /**
   * [Render]
   */
  const BORDER_HR = `solid 8px ${color.format(-0.05)}`;
  const BORDER_TRACE = `solid 1px ${color.format(-0.03)}`;
  const styles = {
    base: css({
      minWidth: 600,
      minHeight: 240,
      boxSizing: 'border-box',
    }),

    main: css({
      Flex: 'y-stretch-stretch',
    }),

    body: {
      base: css({ Flex: 'x-stretch-stretch', paddingTop: 0 }),
      col: css({ flex: 1, Flex: 'y-stretch-stretch', paddingBottom: 15 }),
      divider: css({ width: 20 }),
      trace: css({ borderLeft: BORDER_TRACE, borderRight: BORDER_TRACE }),
      titlebar: css({
        Flex: 'x-center-center',
        fontSize: 11,
        fontWeight: 'bold',
        color: color.format(-0.25),
        borderBottom: BORDER_HR,
        marginBottom: 8,
        PaddingY: 8,
      }),
      hr: css({
        borderTop: BORDER_HR,
        MarginY: 5,
      }),
    },

    empty: css({
      flex: 1,
      Flex: 'y-center-center',
      fontSize: 12,
      fontStyle: 'italic',
      color: color.format(-0.3),
    }),

    /**
     * Content
     */
    peerProps: { base: css({}) },
    peers: { base: css({}) },
    localPeerCard: css({
      marginLeft: 10,
      marginRight: 10,
    }),
  };

  const elTitlebar = <DevSampleNetworkTitlebar />;

  const elPeersList = (
    <BulletList.Layout
      style={{ marginLeft: 0 }}
      orientation={'y'}
      bullet={{ edge: 'near', size: 12 }}
      spacing={5}
      items={peers?.map((data) => ({ data }))}
      renderers={{
        bullet: (e) => {
          return (
            <BulletList.Renderers.Bullet.ConnectorLines
              {...e}
              radius={0}
              lineWidth={3}
              lineColor={color.format(-0.1)}
            />
          );
        },
        body: (e) => {
          if (e.kind !== 'Default') return;
          const status = e.data as t.PeerConnectionStatus;
          const id = status.peer.remote.id;
          const el = <PeerLabel id={id} style={{ marginLeft: 3 }} />;
          return el;
        },
      }}
    />
  );

  const elPeersEmpty = !hasPeers && <div {...styles.empty}>{'No connected peers.'}</div>;

  const elLocal = (
    <div>
      {status && (
        <LocalPeerCard
          title={null}
          bus={bus}
          self={self}
          newConnections={true}
          fields={['PeerId', 'Lifetime', 'Connections.Count']}
          style={styles.localPeerCard}
        />
      )}
    </div>
  );

  const elDiv = <div {...styles.body.divider} />;
  const elDivTraceEdges = <div {...css(styles.body.divider, styles.body.trace)} />;

  const elBody = (
    <div {...styles.body.base}>
      {elDiv}
      <div {...styles.body.col}>
        <div {...styles.body.titlebar}>{'LOCAL'}</div>
        <PeerLabel id={self} style={{ marginLeft: 10, marginBottom: 5 }} />
        <div {...styles.body.hr}>{}</div>
        {elLocal}
      </div>
      {elDivTraceEdges}
      <div {...styles.body.col}>
        <div {...styles.body.titlebar}>{'REMOTE'}</div>
        <div {...styles.peers.base}>{elPeersList}</div>
        {elPeersEmpty}
      </div>
      {elDiv}
    </div>
  );

  return (
    <Card style={css(styles.base, props.style)}>
      {elTitlebar}
      {elBody}
    </Card>
  );
};
