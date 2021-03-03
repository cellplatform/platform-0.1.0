import React, { useState } from 'react';

import { color, css, CssValue, PeerJS, t, defaultValue } from '../common';
import { Peer } from '../Peer';
import { LayoutFooterResize } from './Layout.Footer.Resize';
import { queryString } from '@platform/util.string/lib/queryString';

export type LayoutFooterProps = {
  bus: t.EventBus<any>;
  totalPeers?: number;
  zoom?: number;
  peer: PeerJS;
  style?: CssValue;
};

export const LayoutFooter: React.FC<LayoutFooterProps> = (props) => {
  const { peer, totalPeers = 0 } = props;
  const bus = props.bus.type<t.ConversationEvent>();
  const zoom = defaultValue(props.zoom, 1);

  const MIN = 100;
  const peerHeight = Math.max(MIN, 200 * zoom);
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

  const elPeers =
    peer &&
    Array.from({ length: totalPeers }).map((v, i) => {
      return <Peer key={i} bus={bus} peer={peer} width={peerWidth} height={peerHeight} />;
    });

  const elResize = (
    <LayoutFooterResize
      percent={zoom}
      onDragResize={(e) => {
        bus.fire({
          type: 'Conversation/model/publish',
          payload: { data: { videoZoom: e.percent } },
        });
      }}
    />
  );

  const query = queryString.toObject(location.href);
  const connectTo = (query.connectTo || '').toString();

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.edge}>{elResize}</div>
      <div {...styles.body}>
        <Peer
          bus={bus}
          peer={peer}
          isSelf={true}
          isMuted={true}
          isCircle={false}
          width={peerWidth}
          height={peerHeight}
        />
        <Peer bus={bus} peer={peer} width={peerWidth} height={peerHeight} id={connectTo} />
        {elPeers}
      </div>
      <div {...styles.edge}>{elResize}</div>
    </div>
  );
};
