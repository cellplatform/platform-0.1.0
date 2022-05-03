import React, { useEffect, useState } from 'react';

import { Button, Color, COLORS, css, CssValue, t } from '../common';
import { State } from '../logic';

import { PlayerIndexItem } from './Player.Index.Item';

export type PlayerIndexProps = {
  videos?: t.AppVideo[];
  instance: t.AppInstance;
  state: t.AppState;
  style?: CssValue;
};

export const PlayerIndex: React.FC<PlayerIndexProps> = (props) => {
  const { videos = [], state } = props;
  const events = State.useEvents(props.instance);

  const [isOver, setOver] = useState(false);

  /**
   * [Render]
   */
  const styles = {
    base: css({
      boxSizing: 'border-box',
      borderRadius: 8,
      PaddingX: 20,
      PaddingY: 10,
      backgroundColor: Color.format(0.3),
      border: `solid 1px ${Color.format(0.2)}`,
      backdropFilter: `blur(5px)`,
      // lineHeight: '1.8em',
    }),
    fullscreen: css({ Size: 24, Absolute: [5, 5, null, null] }),
    item: {
      base: css({
        Flex: 'x-center-center',
        PaddingY: 5,
        fontSize: 16,
        lineHeight: '1.8em',
      }),
      title: css({ color: COLORS.DARK, opacity: 0.7 }),
    },
  };

  const elButtons = videos.map((video, i) => {
    return (
      <div key={i}>
        <Button onClick={() => events.video.show(video)}>
          <PlayerIndexItem video={video} />
        </Button>
      </div>
    );
  });

  return (
    <div
      {...css(styles.base, props.style)}
      onMouseEnter={() => setOver(true)}
      onMouseLeave={() => setOver(false)}
    >
      <div>{elButtons}</div>
    </div>
  );
};
