import React from 'react';
import { ObjectView } from 'sys.ui.dev';

import { useLocalPeer } from '../hooks';
import { COLORS, css, CssValue, t } from './common';
import { DevNetwork } from './DEV.Network';
import { useDevState } from './DEV.useDevState';
import { DevVideoFullscreen } from './DEV.Video.Fullscreen';

export type RootLayoutProps = {
  self: t.PeerId;
  bus: t.EventBus<any>;
  netbus: t.EventBus<any>;
  debugJson?: boolean;
  style?: CssValue;
};

export const RootLayout: React.FC<RootLayoutProps> = (props) => {
  const { netbus, bus } = props;
  const peer = useLocalPeer({ self: props.self, bus });
  const state = useDevState({ bus });

  const styles = {
    base: css({
      Absolute: 0,
      Flex: 'horizontal-stretch-stretch',
      color: COLORS.DARK,
      overflow: 'hidden',
    }),
    left: css({
      flex: 1,
      Flex: 'vertical-stretch-stretch',
    }),
    middle: css({
      width: 80,
      Flex: 'vertical-stretch-center',
    }),
    right: css({
      flex: 1,
      padding: 20,
      maxWidth: 350,
    }),
    verticalRule: css({
      flex: 1,
      width: 1,
      borderLeft: `solid 1px ${COLORS.MAGENTA}`,
      borderRight: `solid 1px ${COLORS.MAGENTA}`,
      opacity: 0.3,
    }),
  };

  const elNetwork = peer.status && (
    <div {...styles.left}>
      {<DevNetwork bus={bus} netbus={netbus} peer={peer.status} media={peer.media} />}
    </div>
  );

  const elJson = props.debugJson && (
    <>
      <div {...styles.middle}>
        <div {...styles.verticalRule} />
      </div>
      <div {...styles.right}>
        <ObjectView name={'state'} data={peer.status} expandLevel={5} />
      </div>
    </>
  );

  const elFullscreenVideo = state.fullscreenMedia && (
    <DevVideoFullscreen stream={state.fullscreenMedia} bus={bus} />
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elNetwork}
      {elJson}
      {elFullscreenVideo}
    </div>
  );
};
