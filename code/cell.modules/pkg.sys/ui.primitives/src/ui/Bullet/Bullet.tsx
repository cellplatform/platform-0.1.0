import { domAnimation, LazyMotion, m } from 'framer-motion';
import React from 'react';
import { color, css, CssValue, FC } from '../../common';

type Pixels = number;
type Color = string | number;
type Scale = number;
type Milliseconds = number;

type BulletBody = {
  radius?: Pixels;
  borderColor?: Color;
  backgroundColor?: Color;
  backgroundBlur?: Pixels;
  transition?: Milliseconds;
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

const DEFAULT_BODY: BulletBody = {
  radius: 15,
  borderColor: -0.1,
  backgroundColor: 'rgba(255, 0, 0, 0.1)', // RED.
  backgroundBlur: 1, // Pixel.
};
const DEFAULTS = {
  size: 15,
  radius: 1,
  body: DEFAULT_BODY,
};
const constants = { DEFAULTS };

/**
 * Component
 */
const View: React.FC<BulletProps> = (props) => {
  const { size = DEFAULTS.size, body = DEFAULTS.body, outer, hover } = props;
  const time = `${body.transition}ms`;

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
      transition: body.transition
        ? `background-color ${time}, border-radius ${time}, backdrop-filter ${time}`
        : undefined,
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

/**
 * Export
 */

type Fields = {
  constants: typeof constants;
};
export const Bullet = FC.decorate<BulletProps, Fields>(
  View,
  { constants },
  { displayName: 'Bullet' },
);
