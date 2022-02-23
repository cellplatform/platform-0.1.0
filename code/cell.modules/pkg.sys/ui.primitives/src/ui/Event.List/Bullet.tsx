import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../../common';

type Color = string | number;

export type BulletProps = {
  showHighlight?: boolean;
  backgroundColor?: Color;
  borderColor?: Color;
  style?: CssValue;
};

export const Bullet: React.FC<BulletProps> = (props) => {
  const {
    showHighlight = false,
    backgroundColor: discBackgroundColor = 1,
    borderColor: discBorderColor = -0.3,
  } = props;

  const SIZE = {
    ROOT: 17,
    DISC: 8,
  };

  const discOffset = SIZE.ROOT / 2 - SIZE.DISC / 2;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      Size: SIZE.ROOT,
      boxSizing: 'border-box',
      // backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
    }),
    highlight: css({
      Absolute: [0, null, 0, 0],
      Size: SIZE.ROOT,
      borderRadius: SIZE.ROOT,
      backgroundColor: color.format(0.8),
      backdropFilter: `blur(2px)`,
    }),
    disc: css({
      Absolute: [discOffset, null, null, discOffset],
      boxSizing: 'border-box',
      borderRadius: SIZE.DISC,
      Size: SIZE.DISC,
      backgroundColor: color.format(discBackgroundColor),
      border: `solid 1px ${discBorderColor}`,
    }),
  };

  const elHighlight = showHighlight && <div {...styles.highlight} />;
  const elBullet = <div {...styles.disc} />;

  return (
    <div {...css(styles.base, props.style)}>
      {elHighlight}
      {elBullet}
    </div>
  );
};
