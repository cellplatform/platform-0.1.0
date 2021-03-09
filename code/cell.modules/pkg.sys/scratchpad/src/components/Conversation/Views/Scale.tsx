import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../common';

export type ScaleProps = { style?: CssValue };

export const Scale: React.FC<ScaleProps> = (props) => {
  const col = color.format(-0.1);
  const width = 10;
  const styles = {
    base: css({
      width,
      height: 200,
      borderRight: `solid 2px ${col}`,
      boxSizing: 'border-box',
      position: 'relative',
      pointerEvents: 'none',
    }),
    edge: {
      outer: css({
        Absolute: 0,
        Flex: 'vertical-spaceBetween-end',
      }),
      base: css({
        height: 1,
        borderTop: `solid 2px ${col}`,
      }),
      top: css({ width }),
      center: css({ width }),
      bottom: css({ width }),
    },
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.edge.outer}>
        <div {...css(styles.edge.base, styles.edge.top)}></div>
        <div {...css(styles.edge.base, styles.edge.center)}></div>
        <div {...css(styles.edge.base, styles.edge.bottom)}></div>
      </div>
    </div>
  );
};
