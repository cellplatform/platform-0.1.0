import React from 'react';

import { Button, Color, COLORS, css, CssValue, Icons, t } from '../common';
import { State } from '../logic';

export type PlayerIndexProps = {
  videos?: t.AppVideo[];
  instance: t.AppInstance;
  state: t.AppState;
  style?: CssValue;
};

export const PlayerIndex: React.FC<PlayerIndexProps> = (props) => {
  const { videos = [], state } = props;
  const events = State.useEvents(props.instance);

  /**
   * [Render]
   */
  const styles = {
    base: css({
      lineHeight: '1.6em',
      boxSizing: 'border-box',
      minWidth: 200,
      borderRadius: 8,
      PaddingX: 20,
      PaddingY: 10,
      backgroundColor: Color.format(0.3),
      backdropFilter: `blur(5px)`,
      border: `solid 1px ${Color.format(0.4)}`,
    }),
    fullscreen: css({ Size: 24, Absolute: [5, 5, null, null] }),
    item: {
      base: css({ Flex: 'x-center-center' }),
      icon: css({ marginRight: 6 }),
      title: css({ color: COLORS.DARK }),
    },
  };

  const elButtons = videos.map((video, i) => {
    return (
      <div key={i}>
        <Button onClick={() => events.video.show(video)}>
          <div {...styles.item.base}>
            {/* <Icons.Face color={COLORS.DARK} style={styles.item.icon} /> */}
            <div {...styles.item.title}>{video.title}</div>
          </div>
        </Button>
      </div>
    );
  });

  return (
    <div {...css(styles.base, props.style)}>
      <div>{elButtons}</div>
      {/* {elFullscreenButton} */}
    </div>
  );
};
