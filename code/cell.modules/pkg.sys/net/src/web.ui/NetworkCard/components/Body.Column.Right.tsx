import React from 'react';

import { Label } from '../../Label';
import { css, BulletList, CssValue, t, color, R, k, rx } from '../common';
import { BodyColumnTitle } from './Body.Column';

export type BodyColumnRightProps = {
  instance: t.InstanceId;
  network: t.PeerNetwork;
  peers: t.PeerConnectionStatus[];
  style?: CssValue;
};

export const BodyColumnRight: React.FC<BodyColumnRightProps> = (props) => {
  const { network, instance } = props;
  const bus = rx.busAsType<k.NetworkCardEvent>(network.bus);

  type P = { id: string; connections: t.PeerConnectionStatus[] };
  const grouped = R.groupBy(({ peer }) => peer.remote.id, props.peers);
  const peers: P[] = Object.keys(grouped).map((id) => ({ id, connections: grouped[id] }));
  const hasPeers = peers.length > 0;

  /**
   * [Render]
   */
  const styles = {
    base: css({ Flex: 'y-stretch-stretch' }),
    empty: css({
      flex: 1,
      Flex: 'y-center-center',
      fontSize: 12,
      fontStyle: 'italic',
      color: color.format(-0.3),
      marginBottom: 20,
    }),
    peers: css({}),
    peer: css({ marginLeft: 3 }),
  };

  const elPeersList = (
    <BulletList.Layout
      style={{ marginLeft: 0 }}
      orientation={'y'}
      bullet={{ edge: 'near', size: 12 }}
      spacing={5}
      items={peers.map((data, i) => ({ id: `net.${i}`, data }))}
      renderers={{
        bullet(e) {
          return (
            <BulletList.Renderers.Bullet.ConnectorLines
              {...e}
              radius={0}
              lineWidth={3}
              lineColor={color.format(-0.1)}
            />
          );
        },
        body(e) {
          if (e.kind !== 'Default') return;
          const item = e.data as P;
          const id = item.id;
          const media = item.connections.find((conn) => conn.kind === 'media/video');
          const stream = media ? (media as t.PeerConnectionMediaStatus) : undefined;
          const el = (
            <Label.Peer
              style={styles.peer}
              id={id}
              media={stream?.media}
              moreIcon={true}
              onClick={(e) => {
                const peer = id;
                const media = e.target === 'Icon:Left' ? stream?.media : undefined;
                bus.fire({
                  type: 'sys.net/ui.NetworkCard/PeerClick',
                  payload: { instance, network, peer, media },
                });
              }}
            />
          );
          return el;
        },
      }}
    />
  );

  const elPeersEmpty = !hasPeers && <div {...styles.empty}>{'No connected peers.'}</div>;

  return (
    <div {...css(styles.base, props.style)}>
      <BodyColumnTitle>{'REMOTE'}</BodyColumnTitle>
      <div {...styles.peers}>{elPeersList}</div>
      {elPeersEmpty}
    </div>
  );
};
