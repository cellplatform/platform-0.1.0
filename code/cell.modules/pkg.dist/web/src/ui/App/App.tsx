import React from 'react';

import { css, CssValue, FC, Fullscreen, t, Button, Icons, VIDEOS } from './common';
import { State } from './logic';
import { Auth } from './ui/Auth';
import { PlayerIndex } from './ui/Player.Index';
import { Player } from './ui/Player';

import { FullscreenButton } from './ui/FullscreenButton';
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
  const fullscreen = Fullscreen.useFullscreen({ instance });
  const events = State.useEvents(props.instance);

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

  return (
    <div {...css(styles.base, props.style)} ref={fullscreen.ref}>
      {elPlayerIndex}
      {elFullscreen}
      {elVideo}
      {elAuth}
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
