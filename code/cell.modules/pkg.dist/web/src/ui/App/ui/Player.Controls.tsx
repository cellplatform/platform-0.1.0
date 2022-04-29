import React, { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { Button, COLORS, css, CssValue, Icons, R, Spinner, t } from '../common';
import { State } from '../logic';
import { PlayerProgress } from './Player.Progress';

export type PlayerControlsProps = {
  instance: t.AppInstance;
  state: t.AppState;
  style?: CssValue;
};

export const PlayerControls: React.FC<PlayerControlsProps> = (props) => {
  const { instance, state } = props;
  const video = state.video;

  const events = State.useEvents(instance);
  const [isPlaying, setPlaying] = useState<boolean | null>(null);
  const [percent, setPercent] = useState(0);

  /**
   * [Handlers]
   */
  const handlePlayClick = () => {
    if (isPlaying === null) return;
    if (isPlaying) events.video.player.pause.fire();
    if (!isPlaying) events.video.player.play.fire();
  };

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    const vimeo = events.video.player;
    const dispose$ = new Subject<void>();
    const $ = vimeo.status.$.pipe(takeUntil(dispose$));

    // Update playing status.
    $.pipe(distinctUntilChanged((prev, next) => prev.playing === next.playing)).subscribe((e) => {
      if (isPlaying === null && !e.playing) return;
      setPlaying(e.playing);
    });

    // Update percent.
    vimeo.status.$.subscribe((e) => {
      const percent = R.clamp(0, 1, e.percent);
      setPercent(percent);
      if (percent === 1) {
        vimeo.seek.fire(0);
        if (video?.loop !== true) vimeo.pause.fire();
      }
    });

    return () => dispose$.next();
  }, [isPlaying]); // eslint-disable-line

  /**
   * Exit if video not set.
   */
  if (!video) return null;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      color: COLORS.WHITE,
      Flex: 'x-center-center',
      boxSizing: 'border-box',
    }),
    button: css({ Size: 24 }),
    spinner: css({ Size: 24, Flex: 'center-center' }),
  };

  const elSpinner = isPlaying === null && (
    <div {...styles.spinner}>
      <Spinner color={COLORS.WHITE} size={18} />
    </div>
  );

  const elPlay = isPlaying !== null && (
    <Button style={styles.button} onClick={handlePlayClick}>
      {isPlaying && <Icons.Pause size={24} color={COLORS.WHITE} />}
      {!isPlaying && <Icons.Play size={24} color={COLORS.WHITE} />}
    </Button>
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elSpinner}
      {elPlay}
      <PlayerProgress percent={percent} />
    </div>
  );
};
