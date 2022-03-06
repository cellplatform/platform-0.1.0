import React, { useEffect, useRef, useState } from 'react';
import { color, COLORS, css, CssValue, t, R } from '../../common';

type Pixels = number;
type Color = string | number;

type BulletBody = {
  radius?: Pixels;
  borderColor?: Color;
  backgroundColor?: Color;
  backgroundBlur?: Pixels;
};

type BulletOuter = {
  offset: number;
  radius?: Pixels;
  borderColor?: Color;
  backgroundColor?: Color;
  backgroundBlur?: Pixels;
};

/**
 * Types
 */
export type BulletProps = {
  children?: React.ReactNode;
  size?: Pixels;
  body?: BulletBody;
  outer?: BulletOuter;
  style?: CssValue;
};

/**
 * Constants
 */
const DEFAULTS = {
  size: 15,
  radius: 1,
  body: {
    radius: 15,
    borderColor: -0.1,
    backgroundColor: 'rgba(255, 0, 0, 0.1)', // RED.
    backgroundBlur: 1, // Pixel.
  },
};
export const BulletConstants = { DEFAULTS };

/**
 * Component
 */
export const Bullet: React.FC<BulletProps> = (props) => {
  const { size = DEFAULTS.size, body = DEFAULTS.body, outer } = props;

  console.log('body', body);

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      boxSizing: 'border-box',
      Size: size,
    }),
    body: css({
      Absolute: 0,
      Flex: 'y-center-center',
      borderRadius: body.radius,
      border: Util.toBorder(body.borderColor),
      backgroundColor: color.format(body.backgroundColor),
      backdropFilter: Util.toBlur(body.backgroundBlur),
    }),
    outer:
      outer &&
      css({
        Absolute: 0 - Math.abs(outer.offset),
        borderRadius: outer.radius,
        border: Util.toBorder(outer.borderColor),
        backgroundColor: color.format(outer.backgroundColor),
        backdropFilter: Util.toBlur(outer.backgroundBlur),
      }),
  };

  console.log('-------------------------------------------');
  console.log('Util.toBlur(outer.backgroundBlur)', Util.toBlur(outer?.backgroundBlur));
  console.log('Util.toBlur(body.backgroundBlur)', Util.toBlur(body.backgroundBlur));

  const elOuter = outer && <div {...styles.outer} />;

  return (
    <div {...css(styles.base, props.style)}>
      {elOuter}
      <div {...styles.body}>{props.children}</div>
    </div>
  );
};

/**
 * [Helpers]
 */

const Util = {
  toBorder(value?: Color) {
    return value ? `solid 1px ${color.format(value)}` : undefined;
  },
  toBlur(value?: Pixels) {
    return typeof value === 'number' ? `blur(${Math.abs(value)}px)` : undefined;
  },
};
