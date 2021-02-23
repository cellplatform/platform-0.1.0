import React, { useEffect, useRef, useState } from 'react';
import { css, CssValue, t, color, cuid, PeerJS, COLORS } from '../common';
import { Diagram } from '../Diagram';
import { Peer } from '../Peer';
import { LayoutFooter } from './Layout.Footer';
import { usePeerController } from '../usePeerController';

export type LayoutProps = {
  bus: t.EventBus;
  peer: PeerJS;
  totalPeers?: number;
  imageDir?: string | string[];
  style?: CssValue;
};

export const Layout: React.FC<LayoutProps> = (props) => {
  const { bus, imageDir, peer } = props;

  const styles = {
    base: css({
      flex: 1,
      Flex: 'vertical-stretch-stretch',
      color: COLORS.DARK,
      userSelect: 'none',
      overflow: 'hidden',
    }),
    body: css({ flex: 1, display: 'flex' }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.body}>{imageDir && <Diagram dir={imageDir} />}</div>
      {peer && <LayoutFooter bus={bus} peer={peer} totalPeers={props.totalPeers} />}
    </div>
  );
};
