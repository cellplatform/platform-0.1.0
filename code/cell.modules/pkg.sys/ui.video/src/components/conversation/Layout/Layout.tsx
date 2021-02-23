import React, { useEffect, useRef, useState } from 'react';
import { css, CssValue, t, color, cuid, PeerJS, COLORS } from '../common';
import { Diagram } from '../Diagram';
import { Peer } from '../Peer';
import { LayoutFooter } from './Layout.Footer';

export type LayoutProps = {
  totalPeers?: number;
  imageDir?: string | string[];
  style?: CssValue;
};

export const Layout: React.FC<LayoutProps> = (props) => {
  const { imageDir } = props;
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
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.body}>{imageDir && <Diagram dir={imageDir} />}</div>
      {peer && <LayoutFooter peer={peer} totalPeers={props.totalPeers} />}
    </div>
  );
};
