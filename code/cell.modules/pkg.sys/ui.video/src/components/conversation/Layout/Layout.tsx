import React, { useEffect, useRef, useState } from 'react';
import { css, CssValue, t, color, cuid, PeerJS, COLORS } from '../common';
import { Diagram } from '../Diagram';
import { Peer } from '../Peer';

export type LayoutProps = {
  peers?: number;
  style?: CssValue;
};

export const Layout: React.FC<LayoutProps> = (props) => {
  const { peers = 0 } = props;
  const [peer, setPeer] = useState<PeerJS>();

  useEffect(() => {
    const self = cuid();
    const peer = new PeerJS(self);
    peer.on('open', (id) => setPeer(peer));
    return () => peer?.destroy();
  }, []); // eslint-disable-line

  const styles = {
    base: css({
      flex: 1,
      Flex: 'vertical-stretch-stretch',
      color: COLORS.DARK,
      userSelect: 'none',
      overflow: 'hidden',
    }),
    body: css({
      flex: 1,
      display: 'flex',
    }),
    footer: css({
      height: 280,
      borderTop: `solid 8px ${color.format(-0.1)}`,
      Flex: 'horizontal-center-spaceBetween',
      overflow: 'hidden',
      MarginX: 30,
    }),
  };

  const elPeers =
    peer &&
    Array.from({ length: peers }).map((v, i) => {
      return <Peer key={i} peer={peer} />;
    });

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.body}>
        <Diagram dir={'static/images.tmp/'} />
      </div>
      <div {...styles.footer}>
        {peer && (
          <>
            <Peer peer={peer} isSelf={true} isMuted={true} isCircle={false} />
            <Peer peer={peer} />
            {elPeers}
          </>
        )}
      </div>
    </div>
  );
};
