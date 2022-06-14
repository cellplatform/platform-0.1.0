import React, { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Label } from '../../Label';
import { color, css, CssValue, k, List, R, rx, t } from '../common';
import { BodyColumnTitle } from './Body.Column';

export type BodyColumnRightProps = {
  instance: { network: t.PeerNetwork; id: t.Id };
  style?: CssValue;
};

export const BodyColumnRight: React.FC<BodyColumnRightProps> = (props) => {
  const { instance } = props;
  const network = instance.network;
  const bus = rx.busAsType<k.NetworkCardEvent>(network.bus);

  type P = { id: string; connections: t.PeerConnectionStatus[] };
  const [peers, setPeers] = useState<P[]>([]);
  const hasPeers = peers.length > 0;

  const updatePeers = (connections: t.PeerConnectionStatus[]) => {
    const grouped = R.groupBy(({ peer }) => peer.remote.id, connections);
    const items: P[] = Object.keys(grouped).map((id) => ({ id, connections: grouped[id] }));
    setPeers(items);
  };

  useEffect(() => {
    const { dispose, dispose$ } = rx.disposable();
    const status$ = network.status.$.pipe(takeUntil(dispose$));
    status$.subscribe((e) => updatePeers(e.connections));
    return dispose;
  }, []); // eslint-disable-line

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
    <List.Layout
      instance={{ bus, id: instance.id }}
      style={{ marginLeft: 0 }}
      orientation={'y'}
      bullet={{ edge: 'near', size: 12 }}
      spacing={5}
      items={peers.map((data) => ({ data }))}
      renderers={{
        bullet(e) {
          return (
            <List.Renderers.Bullet.ConnectorLines
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
                  payload: { instance: instance.id, network, peer, media },
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
