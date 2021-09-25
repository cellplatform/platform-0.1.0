import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../../common';

export type MaskEdge = 'top' | 'bottom';
type Milliseconds = number;

export type MaskProps = {
  edge: MaskEdge;
  height: number;
  bevelHeight: number;
  isOpen?: boolean;
  slideDuration: Milliseconds;
  backdropFilter?: string;
  backgroundColor?: string;
  style?: CssValue;
};

export const Mask: React.FC<MaskProps> = (props) => {
  const { edge, backgroundColor, backdropFilter, height, slideDuration } = props;
  const isOpen = Boolean(props.isOpen);

  const styles = {
    base: css({
      Absolute: [edge === 'top' ? 0 : null, 0, edge === 'bottom' ? 0 : null, 0],
      boxSizing: 'border-box',
      height: '50%',
      backgroundColor,
      backdropFilter,
      transform: toTransform({ isOpen, edge, height }),
      transition: `transform ${slideDuration}ms ease`,
    }),
    bevel: {
      base: css({
        Absolute: [edge === 'top' ? null : 0, 0, edge === 'bottom' ? null : 0, 0],
        height: props.bevelHeight,
        backgroundColor: color.format(-0.03),
      }),
      top: css({
        borderTop: `solid 2px ${color.format(-0.04)}`,
        borderBottom: `solid 1px ${color.format(-0.15)}`,
      }),
      bottom: css({
        borderTop: `solid 1px ${color.format(isOpen ? -0.15 : 0)}`,
        borderBottom: `solid 2px ${color.format(-0.04)}`,
      }),
    },
  };

  const elBevel = (
    <div
      {...css(
        styles.bevel.base,
        edge === 'top' && styles.bevel.top,
        edge === 'bottom' && styles.bevel.bottom,
      )}
    ></div>
  );

  return <div {...css(styles.base, props.style)}>{elBevel}</div>;
};

/**
 * [Helpers]
 */

const toTransform = (args: { isOpen: boolean; edge: MaskEdge; height: number }) => {
  const { isOpen, edge, height } = args;
  const offset = edge === 'top' ? 0 - height : height;
  return isOpen ? `translateY(${offset}px)` : `translateY(0px)`;
};
