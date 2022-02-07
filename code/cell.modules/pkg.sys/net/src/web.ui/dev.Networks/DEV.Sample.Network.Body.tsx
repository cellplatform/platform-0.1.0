import React from 'react';

import { BulletList, color, css, CssValue, LocalPeerCard, t } from './DEV.common';
import { PeerLabel } from './DEV.PeerLabel';

export type DevSampleNetworkBodyProps = {
  bus: t.EventBus<any>;
  self: t.PeerId;
  peers: t.PeerConnectionStatus[];
  status?: t.PeerStatus;
  style?: CssValue;
};

export const DevSampleNetworkBody: React.FC<DevSampleNetworkBodyProps> = (props) => {
  const { self, bus, peers, status } = props;
  const hasPeers = peers.length > 0;

  /**
   * [Render]
   */
  const BORDER_HR = `solid 8px ${color.format(-0.05)}`;
  const BORDER_TRACE = `solid 1px ${color.format(-0.03)}`;

  const styles = {
    base: css({
      Flex: 'x-stretch-stretch',
      paddingTop: 0,
    }),
    column: css({
      flex: 1,
      Flex: 'y-stretch-stretch',
      paddingBottom: 30,
    }),
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
    hr: css({ borderTop: BORDER_HR, MarginY: 5 }),

    peers: { base: css({}) },

    localPeerCard: css({
      marginLeft: 10,
      marginRight: 10,
    }),

    empty: css({
      flex: 1,
      Flex: 'y-center-center',
      fontSize: 12,
      fontStyle: 'italic',
      color: color.format(-0.3),
    }),
  };

  const elPeersList = (
    <BulletList.Layout
      style={{ marginLeft: 0 }}
      orientation={'y'}
      bullet={{ edge: 'near', size: 12 }}
      spacing={5}
      items={peers.map((data) => ({ data }))}
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
          fields={['PeerId', 'Lifetime']}
          style={styles.localPeerCard}
        />
      )}
    </div>
  );

  const elDiv = <div {...styles.divider} />;
  const elDivTraceEdges = <div {...css(styles.divider, styles.trace)} />;

  return (
    <div {...css(styles.base, props.style)}>
      {' '}
      {elDiv}
      <div {...styles.column}>
        <div {...styles.titlebar}>{'LOCAL'}</div>
        <PeerLabel id={self} style={{ marginLeft: 10, marginBottom: 5 }} />
        <div {...styles.hr}>{}</div>
        {elLocal}
      </div>
      {elDivTraceEdges}
      <div {...styles.column}>
        <div {...styles.titlebar}>{'REMOTE'}</div>
        <div {...styles.peers.base}>{elPeersList}</div>
        {elPeersEmpty}
      </div>
      {elDiv}
    </div>
  );
};
