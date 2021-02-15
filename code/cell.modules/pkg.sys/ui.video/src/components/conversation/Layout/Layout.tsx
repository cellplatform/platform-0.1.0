import React, { useEffect, useRef, useState } from 'react';
import { css, CssValue, t, color, cuid, PeerJS } from '../common';
import { MeetingDoc } from '../MeetingDoc';
import { Peer } from '../Peer';

export type LayoutProps = { style?: CssValue };

export const Layout: React.FC<LayoutProps> = (props) => {
  const self = cuid();

  const [peer, setPeer] = useState<PeerJS>();

  useEffect(() => {
    const peer = new PeerJS(self);
    peer.on('open', (id) => setPeer(peer));
    return () => peer?.destroy();
  }, []); // eslint-disable-line

  const styles = {
    base: css({
      flex: 1,
      Flex: 'vertical-stretch-stretch',
      PaddingX: 30,
    }),
    body: css({
      flex: 1,
      display: 'flex',
    }),
    footer: css({
      height: 280,
      borderTop: `solid 8px ${color.format(-0.1)}`,
      Flex: 'horizontal-center-spaceBetween',
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.body}>
        <MeetingDoc />
      </div>
      <div {...styles.footer}>
        {peer && (
          <>
            <Peer peer={peer} isSelf={true} muted={true} />
            <Peer peer={peer} muted={true} />
          </>
        )}
      </div>
    </div>
  );
};
