import React, { useRef } from 'react';
import { ObjectView } from 'sys.ui.dev';

import { useLocalPeer } from '../hooks';
import { COLORS, css, CssValue, t, useDragTarget } from './common';
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

  const baseRef = useRef<HTMLDivElement>(null);

  /**
   * NOTE: This drag monitor is setup to prevent arbitrarily dropped
   *       files from loading into a new tab (cancel default browser event).
   *
   *       This same hook can then be used within sub-components to actually
   *       capture and work with OS level file drops as per each component's context.
   */
  useDragTarget(baseRef);

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
      Flex: 'vertical-stretch-end',
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
    <div ref={baseRef} {...css(styles.base, props.style)}>
      {elNetwork}
      {elJson}
      {elFullscreenVideo}
    </div>
  );
};
