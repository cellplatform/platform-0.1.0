import React, { useEffect, useRef, useState } from 'react';
import { filter, take } from 'rxjs/operators';

import {
  Button,
  color,
  COLORS,
  css,
  CssValue,
  Icons,
  t,
  time,
  useResizeObserver,
  Vimeo,
} from '../common';
import { State } from '../logic';

import { PlayerControls } from './Player.Controls';

export type PlayerProps = {
  instance: t.AppInstance;
  state: t.AppState;
  autostart?: boolean;
  style?: CssValue;
};

export const Player: React.FC<PlayerProps> = (props) => {
  const { instance, state, autostart = true } = props;
  const video = state.video;
  const resize = useResizeObserver();
  const events = State.useEvents(instance);
  const [started, setStarted] = useState(false);
  const [ready, setReady] = useState(false);

  const fade = 500;

  /**
   * Lifecycle
   */

  useEffect(() => {
    time.delay(fade, () => setReady(true));
  }, []);

  useEffect(() => {
    // Reveal video (when started).
    events.video.player.status.$.pipe(
      filter((e) => e.seconds > 0),
      take(1),
    ).subscribe((e) => setStarted(true));

    // Auto start the video.
    if (resize.ready && autostart) {
      time.delay(0, events.video.player.play.fire);
    }
  }, [resize.ready, autostart]); // eslint-disable-line

  if (!video) return null;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      backgroundColor: COLORS.BLACK,
      Flex: 'center-center',
      opacity: ready ? 1 : 0,
      transition: `opacity ${fade}ms`,
    }),
    video: css({
      opacity: started ? 1 : 0,
      transition: `opacity ${fade}ms`,
    }),
    close: css({
      Size: 24,
      Absolute: [null, 5, 5, null],
    }),
    controls: css({
      Absolute: [null, null, 5, 5],
    }),
  };

  const elVideo = resize.ready && (
    <Vimeo
      width={resize.rect.width}
      height={resize.rect.height}
      instance={props.instance}
      video={video.id}
      style={styles.video}
      borderRadius={50}
    />
  );

  const elCloseButton = (
    <Button
      style={styles.close}
      onClick={() => {
        setReady(false);
        time.delay(fade, () => events.video.hide());
      }}
    >
      <Icons.Fullscreen.Exit color={COLORS.WHITE} size={24} />
    </Button>
  );

  const elControls = <PlayerControls state={state} instance={instance} style={styles.controls} />;

  return (
    <div {...css(styles.base, props.style)} ref={resize.ref}>
      {elVideo}
      {elControls}
      {elCloseButton}
    </div>
  );
};
