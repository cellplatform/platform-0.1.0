import { domAnimation, LazyMotion, m } from 'framer-motion';
import React from 'react';
import { color, css, CssValue } from '../../common';

type Pixels = number;
type Color = string | number;
type Scale = number;
type Milliseconds = number;

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

type BulletHover = { over: Scale; down: Scale; duration: Milliseconds };
type M = React.MouseEventHandler<HTMLDivElement>;

/**
 * Types
 */
export type BulletProps = {
  children?: React.ReactNode;
  size?: Pixels;
  body?: BulletBody;
  outer?: BulletOuter;
  hover?: BulletHover;
  style?: CssValue;
  onClick?: M;
  onMouseDown?: M;
  onMouseUp?: M;
  onMouseEnter?: M;
  onMouseLeave?: M;
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
  const { size = DEFAULTS.size, body = DEFAULTS.body, outer, hover } = props;

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

  const duration = (hover?.duration || 0) / 1000;
  const whileHover = !hover ? undefined : { scale: hover.over, transition: { duration } };
  const whileTap = !hover ? undefined : { scale: hover.down };

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        {...css(styles.base, props.style)}
        style={{ originX: 'center', originY: 'center' }}
        whileHover={whileHover}
        whileTap={whileTap}
        onClick={props.onClick}
        onMouseDown={props.onMouseDown}
        onMouseUp={props.onMouseUp}
        onMouseEnter={props.onMouseEnter}
        onMouseLeave={props.onMouseLeave}
      >
        {outer && <m.div {...styles.outer} />}
        <m.div {...styles.body}>{props.children}</m.div>
      </m.div>
    </LazyMotion>
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