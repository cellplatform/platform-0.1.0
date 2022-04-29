import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t } from '../../common';

export type PlayerProgressProps = {
  percent: number;
  style?: CssValue;
};

export const PlayerProgress: React.FC<PlayerProgressProps> = (props) => {
  const { percent } = props;

  /**
   * Handlers
   */
  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    // console.log('e', e);
  };

  /**
   * [Render]
   */
  const styles = {
    base: css({
      backgroundColor: Color.format(0.1),
      border: `solid 1px ${Color.format(0.1)}`,
      width: 120,
      MarginX: 6,
      height: 4,
      borderRadius: 4,
    }),
    thumb: css({
      height: 4,
      width: `${percent * 100}%`,
      backgroundColor: Color.format(1),
      borderRadius: 4,
    }),
  };
  return (
    <div {...css(styles.base, props.style)} onDoubleClick={handleDoubleClick}>
      <div {...styles.thumb} />
    </div>
  );
};
