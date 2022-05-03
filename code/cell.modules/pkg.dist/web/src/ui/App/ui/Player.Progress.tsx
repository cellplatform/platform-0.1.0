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
    /**
     * TODO 🐷
     * - seek to clicked location
     */
    console.log('mouse event:', e);
    console.log('el (target):', e.target);
  };

  /**
   * [Render]
   */
  const styles = {
    base: css({
      backgroundColor: Color.format(0.2),
      border: `solid 1px ${Color.format(0.35)}`,
      width: 40,
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
    <div {...css(styles.base, props.style)} onClick={handleDoubleClick}>
      <div {...styles.thumb} />
    </div>
  );
};
