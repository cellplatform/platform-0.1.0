import React, { useState, useEffect } from 'react';

import { color, css, CssValue, PeerJS, t, defaultValue, R, Query, rx } from '../common';
import { Peer } from '../Peer';
import { LayoutFooterResize } from './Layout.VideoBar.Resize';

export type LayoutFooterProps = {
  bus: t.EventBus<any>;
  model?: t.ConversationState;
  zoom?: number;
  peer: PeerJS;
  style?: CssValue;
};

export const LayoutFooter: React.FC<LayoutFooterProps> = (props) => {
  const { peer, model } = props;
  const bus = rx.busAsType<t.ConversationEvent>(props.bus);
  const zoom = defaultValue(props.zoom, 1);

  type P = { token: string; call?: PeerJS.MediaConnection };

  const [peerTokens, setPeerTokens] = useState<P[]>([]);

  const MIN_HEIGHT = 60;
  const peerHeight = Math.max(MIN_HEIGHT, 120 * zoom);
  const peerWidth = peerHeight * 1.6;
  const isLabelVisible = peerWidth > 170;

  const styles = {
    base: css({
      Flex: 'horizontal-stretch-spaceBetween',
      backgroundColor: color.format(0.6),
      backdropFilter: `blur(8px)`,
      borderRadius: 20,
      boxShadow: `0 0 15px 0 ${color.format(-0.1)}`,
    }),

    edge: css({
      position: 'relative',
      width: 15,
      display: 'flex',
    }),

    body: css({
      flex: 1,
      Flex: 'horizontal-center-spaceBetween',
      overflow: 'hidden',
      // padding: 10,
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

      const connectTo = Query.parse()
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
          isLabelVisible={isLabelVisible}
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
          isLabelVisible={isLabelVisible}
        />
        {elPeers}
      </div>
      <div {...styles.edge}>{elResize}</div>
    </div>
  );
};
