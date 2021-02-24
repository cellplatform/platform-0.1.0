import React, { useEffect, useRef, useState } from 'react';
import { css, CssValue, t, color, cuid, PeerJS, COLORS } from '../common';
import { Diagram } from '../Diagram';
import { Peer } from '../Peer';
import { LayoutFooterResize } from './Layout.Footer.Resize';

export type LayoutFooterProps = {
  bus: t.EventBus<any>;
  totalPeers?: number;
  peer: PeerJS;
  style?: CssValue;
};

export const LayoutFooter: React.FC<LayoutFooterProps> = (props) => {
  const { peer, totalPeers = 0, bus } = props;
  const [zoom, setZoom] = useState<number>(1);

  const peerHeight = Math.max(80, 200 * zoom);
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
      borderTop: `solid 8px ${color.format(-0.1)}`,
      paddingTop: 15,
      paddingBottom: 10,
    }),
  };

  const elPeers =
    peer &&
    Array.from({ length: totalPeers }).map((v, i) => {
      return <Peer key={i} bus={bus} peer={peer} width={peerWidth} height={peerHeight} />;
    });

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.edge}></div>
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
        <Peer bus={bus} peer={peer} width={peerWidth} height={peerHeight} />
        {elPeers}
      </div>
      <div {...styles.edge}>
        <LayoutFooterResize
          percent={zoom}
          onDragResize={(e) => {
            setZoom(e.percent);
          }}
        />
      </div>
    </div>
  );
};
