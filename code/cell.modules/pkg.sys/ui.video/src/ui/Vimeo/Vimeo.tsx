import VimeoPlayer from '@vimeo/player';
import React, { useEffect, useRef, useState } from 'react';

import { css, CssValue, t, types } from './common';
import { VimeoEvents } from './VimeoEvents';
import { usePlayerController, useIconController } from './hooks';
import { IconOverlay, VimeoIconClickArgs } from './components/IconOverlay';

export type VimeoProps = {
  bus: t.EventBus<any>;
  id: string;
  video: number;
  muted?: boolean;
  width?: number;
  height?: number;
  borderRadius?: number;
  scale?: number;
  icon?: types.VimeoIconFlag;
  style?: CssValue;
  onIconClick?: (e: VimeoIconClickArgs) => void;
};

/**
 * Wrapper for the Vimeo player API.
 * https://github.com/vimeo/player.js
 */
const Component: React.FC<VimeoProps> = (props) => {
  const { id, video, width, height, bus, borderRadius, muted } = props;
  const divRef = useRef<HTMLDivElement>(null);

  const [player, setPlayer] = useState<VimeoPlayer>();

  useEffect(() => {
    const div = divRef.current as HTMLDivElement;

    const player = new VimeoPlayer(div, {
      id: video,
      width,
      height,
      controls: false,
      transparent: true,
      title: false,
      byline: false,
      portrait: false,
      loop: false,
      dnt: true, // Do Not Track ("no cookies" or other tracking attempts).
    });

    setPlayer(player);

    return () => {
      player?.destroy();
    };
  }, [width, height]); // eslint-disable-line

  const controller = usePlayerController({ id, video, player, bus });

  useEffect(() => {
    const events = VimeoEvents({ id, bus });

    if (player && typeof video === 'number') {
      events.load.fire(video, { muted });
    }

    return () => events.dispose();
  }, [video, player]); // eslint-disable-line

  useEffect(() => {
    if (player) player.setMuted(props.muted ?? false);
  }, [player, props.muted]);

  const styles = {
    base: css({
      lineHeight: 0, // NB: Prevents space below IFrame.
      position: 'relative',
      overflow: 'hidden',
      borderRadius,
      width,
      height,
      opacity: controller.opacity,
      transition: `opacity 200ms`,
      ':first-child': { transform: `scale(${props.scale ?? 1})` },
    }),
    container: css({ width, height, position: 'relative' }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div ref={divRef} {...styles.container}></div>
      <IconOverlay icon={props.icon} onClick={props.onIconClick} />
    </div>
  );
};

/**
 * Export extended function.
 */
(Component as any).Events = VimeoEvents;
(Component as any).useIconController = useIconController;

type T = React.FC<VimeoProps> & {
  Events: t.VimeoEventsFactory;
  useIconController: t.UseVimeoIconController;
};
export const Vimeo = Component as T;
