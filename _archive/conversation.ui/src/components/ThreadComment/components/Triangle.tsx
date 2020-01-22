import * as React from 'react';
import { css, GlamorValue } from '../../../common';
import { color } from '@platform/css';

export type ITriangleProps = {
  backgroundColor?: number | string;
  borderColor?: number | string;
  style?: GlamorValue;
};

export const Triangle = (props: ITriangleProps) => {
  const backgroundColor = color.format(props.backgroundColor);
  const styles = {
    base: css({
      boxSizing: 'border-box',
      width: 9,
      height: 15,
      borderRight: `solid 1px ${backgroundColor}`,
      overflow: 'hidden',
      paddingLeft: 4,
    }),
    inner: css({
      position: 'relative',
      top: -1,
      border: `solid 1px ${color.format(-0.1)}`,
      backgroundColor,
      width: 15,
      height: 15,
      transform: `rotate(-45deg)`,
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.inner} />
    </div>
  );
};
