import React, { useState } from 'react';

import {
  Color,
  COLORS,
  css,
  CssValue,
  FC,
  Fullscreen,
  t,
  useResizeObserver,
  VIDEOS,
} from './common';
import { State } from './logic';
import { Auth } from './ui/Auth';
import { FullscreenButton } from './ui/FullscreenButton';
import { Player } from './ui/Player';
import { PlayerIndex } from './ui/Player.Index';

const { Events, Controller } = State;

export type AppProps = {
  instance: t.AppInstance;
  state: t.AppState;
  style?: CssValue;
};

/**
 * Component
 */
const View: React.FC<AppProps> = (props) => {
  const { instance, state } = props;
  const events = State.useEvents(props.instance);

  const [tooSmall, setTooSmall] = useState(false);

  const checkTooSmall = (size: t.DomRect) => {
    if (size.width < 500) return true;
    if (size.height < 500) return true;
    return false;
  };

  const fullscreen = Fullscreen.useFullscreen({ instance });
  useResizeObserver({
    ref: fullscreen.ref,
    onSize: (e) => setTooSmall(checkTooSmall(e)),
  });

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      backgroundImage: `url(/static/images/App/paul.jpg)`,
      backgroundPosition: 'center center',
      backgroundSize: 'cover',
    }),
    body: css({ Absolute: 0 }),
    tooSmall: css({
      Absolute: 0,
      backgroundColor: Color.format(0.6),
      backdropFilter: `blur(8px)`,
      flex: 1,
      Flex: 'center-center',
      color: Color.alpha(COLORS.DARK, 0.6),
      fontSize: 14,
      fontStyle: 'italic',
    }),

    index: css({ Absolute: [null, null, 10, 10] }),
    video: css({ Absolute: 0 }),
    fullscreen: css({ Absolute: [5, 5, null, null] }),
  };

  const elPlayerIndex = state.auth.isOpen && (
    <PlayerIndex instance={instance} state={state} videos={VIDEOS} style={styles.index} />
  );

  const elVideo = state.video && <Player instance={instance} state={state} style={styles.video} />;

  const elAuth = <Auth instance={instance} state={state} />;

  const elFullscreen = !fullscreen.isFullscreen && (
    <FullscreenButton instance={instance} state={state} style={styles.fullscreen} />
  );

  const elTooSmall = <div {...css(styles.tooSmall)}>{`Screen is too small.`}</div>;

  const elBody = (
    <div {...styles.body}>
      {elPlayerIndex}
      {elFullscreen}
      {elVideo}
      {elAuth}
    </div>
  );

  return (
    <div {...css(styles.base, props.style)} ref={fullscreen.ref}>
      {tooSmall ? elTooSmall : elBody}
    </div>
  );
};

/**
 * Export
 */
type Fields = {
  Events: typeof State.Events;
  Controller: typeof State.Controller;
};
export const App = FC.decorate<AppProps, Fields>(
  View,
  { Events, Controller },
  { displayName: 'App' },
);
