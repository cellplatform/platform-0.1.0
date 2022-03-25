import React from 'react';

import { color, css, CssValue } from '../../common';

export type MaskEdge = 'top' | 'bottom';
type Milliseconds = number;

export type MaskProps = {
  edge: MaskEdge;
  height: number;
  bevelHeight: number;
  isOpen?: boolean;
  slideDuration: Milliseconds;
  backdropFilter?: string;
  backdropFilterTransition?: Milliseconds;
  backgroundColor?: string;
  style?: CssValue;
};

export const Mask: React.FC<MaskProps> = (props) => {
  const {
    edge,
    backgroundColor,
    backdropFilter,
    backdropFilterTransition = 0,
    height,
    slideDuration,
  } = props;
  const isOpen = Boolean(props.isOpen);

  const styles = {
    base: css({
      Absolute: [edge === 'top' ? 0 : null, 0, edge === 'bottom' ? 0 : null, 0],
      boxSizing: 'border-box',
      height: '50%',
      backgroundColor,
      backdropFilter,
      transform: toTransform({ isOpen, edge, height }),
      transition: `transform ${slideDuration}ms ease, backdrop-filter ${backdropFilterTransition}ms ease`,
    }),
    bevel: {
      base: css({
        Absolute: [edge === 'top' ? null : 0, 0, edge === 'bottom' ? null : 0, 0],
        height: props.bevelHeight,
        backgroundColor: color.format(-0.03),
      }),
      top: css({
        borderTop: `solid 2px ${color.format(-0.04)}`,
      }),
      bottom: css({
        borderBottom: `solid 2px ${color.format(-0.04)}`,
      }),
      border: {
        base: css({
          Absolute: [null, 0, null, 0],
          height: 1,
          Flex: 'horizontal-spaceBetween-stretch',
        }),
        top: { top: 0 },
        bottom: { bottom: 0, opacity: 0 },
        line: css({ backgroundColor: color.format(-0.2), flex: 1 }),
        spacer: css({ width: 24 }),
      },
    },
  };

  const elBevel = (
    <div
      {...css(
        styles.bevel.base,
        edge === 'top' && styles.bevel.top,
        edge === 'bottom' && styles.bevel.bottom,
      )}
    >
      <div
        {...css(
          styles.bevel.border.base,
          edge === 'top' && styles.bevel.border.bottom,
          edge === 'bottom' && styles.bevel.border.top,
        )}
      >
        <div {...styles.bevel.border.line}></div>
        <div {...styles.bevel.border.spacer}></div>
        <div {...styles.bevel.border.line}></div>
      </div>
    </div>
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
