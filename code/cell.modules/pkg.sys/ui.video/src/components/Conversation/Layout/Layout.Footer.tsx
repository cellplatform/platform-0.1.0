import React, { useState, useEffect } from 'react';

import { color, css, CssValue, PeerJS, t, defaultValue, R, QueryString } from '../common';
import { Peer } from '../Peer';
import { LayoutFooterResize } from './Layout.Footer.Resize';

export type LayoutFooterProps = {
  bus: t.EventBus<any>;
  model?: t.ConversationState;
  zoom?: number;
  peer: PeerJS;
  style?: CssValue;
};

export const LayoutFooter: React.FC<LayoutFooterProps> = (props) => {
  const { peer, model } = props;
  const bus = props.bus.type<t.ConversationEvent>();
  const zoom = defaultValue(props.zoom, 1);

  type P = { token: string; call?: PeerJS.MediaConnection };

  const [peerTokens, setPeerTokens] = useState<P[]>([]);

  const MIN = 100;
  const peerHeight = Math.max(MIN, 120 * zoom);
  const peerWidth = peerHeight * 1.6;

  const styles = {
    base: css({
      Flex: 'horizontal-stretch-spaceBetween',
    }),

    edge: css({
      position: 'relative',
      width: 30,
      display: 'flex',
    }),

    body: css({
      flex: 1,
      Flex: 'horizontal-center-spaceBetween',
      overflow: 'hidden',
      borderBottom: `solid 8px ${color.format(-0.1)}`,
      paddingBottom: 10,
      paddingTop: 15,
    }),
  };

  useEffect(() => {
    /**
     * Listen for incoming calls.
     */
    peer.on('call', async (call) => {
      const token = call.peer;
      setPeerTokens((prev) => {
        const exists = prev.some((item) => item.token === token);
        return exists ? prev : [...prev, { token, call }];
      });
    });

    setPeerTokens((prev) => {
      const self = peer.id;

      const connectTo = QueryString.parse()
        .connectTo.filter((token) => token !== self)
        .filter((token) => !prev.some((item) => item.token === token))
        .map((token) => ({ token }));

      return R.uniq([...prev, ...connectTo]);
    });
  }, []); // eslint-disable-line

  const elResize = (
    <LayoutFooterResize
      percent={zoom}
      onDragResize={(e) => {
        bus.fire({
          type: 'Conversation/publish',
          payload: { kind: 'model', data: { videoZoom: e.percent } },
        });
      }}
    />
  );

  const elPeers = peerTokens
    .filter((item) => item.token !== peer.id)
    .map((item) => {
      const { token, call } = item;
      return (
        <Peer
          key={`peer-${token}`}
          id={token}
          call={call}
          bus={bus}
          peer={peer}
          width={peerWidth}
          height={peerHeight}
          model={model}
        />
      );
    });

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.edge}>{elResize}</div>
      <div {...styles.body}>
        <Peer
          bus={bus}
          peer={peer}
          isSelf={true}
          isMuted={true}
          width={peerWidth}
          height={peerHeight}
          model={model}
        />
        {elPeers}
      </div>
      <div {...styles.edge}>{elResize}</div>
    </div>
  );
};
