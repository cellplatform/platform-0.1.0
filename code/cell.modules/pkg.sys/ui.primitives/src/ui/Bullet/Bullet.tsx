import React, { useEffect, useRef, useState } from 'react';
import { color, COLORS, css, CssValue, t } from '../../common';

type Pixels = number;

/**
 * Types
 */
export type BulletProps = {
  size?: Pixels;
  style?: CssValue;
};

/**
 * Constants
 */
const DEFAULTS = { SIZE: 18 };
export const BulletConstants = { DEFAULTS };

/**
 * Component
 */
export const Bullet: React.FC<BulletProps> = (props) => {
  const { size = DEFAULTS.SIZE } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      Size: size,
    }),
  };
  return <div {...css(styles.base, props.style)}></div>;
};
