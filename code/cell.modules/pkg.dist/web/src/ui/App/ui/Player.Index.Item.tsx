import React, { useEffect, useRef, useState } from 'react';
import { color, COLORS, css, CssValue, t } from '../../common';

export type PlayerIndexItemProps = {
  video: t.AppVideo;
  style?: CssValue;
};

export const PlayerIndexItem: React.FC<PlayerIndexItemProps> = (props) => {
  const { video } = props;
  const [isOver, setOver] = useState(false);

  /**
   * [Render]
   */
  const styles = {
    base: css({
      Flex: 'x-center-center',
      PaddingY: 5,
      fontSize: 16,
      lineHeight: '1.8em',
      // transition: `padding ${duration}ms, font-size ${duration}ms`,
    }),
    title: css({ color: COLORS.DARK, opacity: 0.7 }),
  };
  return (
    <div
      {...css(styles.base, props.style)}
      onMouseEnter={() => setOver(true)}
      onMouseLeave={() => setOver(false)}
    >
      <div {...styles.title}>{video.title}</div>
    </div>
  );
};
