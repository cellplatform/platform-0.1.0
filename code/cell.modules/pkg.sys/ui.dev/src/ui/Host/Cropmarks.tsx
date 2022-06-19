import * as React from 'react';
import { Color, css, CssValue } from '../../common';

export type CropmarksProps = {
  size: number;
  margin: number;
  color?: string | number;
  style?: CssValue;
};

export const Cropmarks: React.FC<CropmarksProps> = (props) => {
  const { margin, size } = props;
  const offset = 0 - (size + margin);

  const styles = {
    base: css({ Absolute: 0, pointerEvents: 'none' }),
    topLeft: css({ Absolute: [offset, null, null, offset] }),
    topRight: css({ Absolute: [offset, offset, null, null] }),
    bottomLeft: css({ Absolute: [null, null, offset, offset] }),
    bottomRight: css({ Absolute: [null, offset, offset, null] }),
  };

  const corner = (style: CssValue, x: 'W' | 'E', y: 'N' | 'S') => {
    return (
      <CropmarkCorner x={x} y={y} margin={margin} size={size} color={props.color} style={style} />
    );
  };

  return (
    <div {...css(styles.base, props.style)}>
      {corner(styles.topLeft, 'E', 'S')}
      {corner(styles.topRight, 'W', 'S')}
      {corner(styles.bottomLeft, 'E', 'N')}
      {corner(styles.bottomRight, 'W', 'N')}
    </div>
  );
};

export type CropmarkCornerProps = {
  x: 'W' | 'E';
  y: 'N' | 'S';
  size: number;
  margin: number;
  color?: string | number;
  style: CssValue;
};

export const CropmarkCorner: React.FC<CropmarkCornerProps> = (props) => {
  const { x, y } = props;
  const margin = props.margin;
  const size = props.size + margin;
  const color = Color.format(props.color ?? 1);

  const styles = {
    base: css({
      width: size,
      height: size,
    }),
    x: css({
      background: color,
      height: 1,
      Absolute: [
        y === 'N' ? 0 : null,
        x === 'E' ? margin : 0,
        y === 'S' ? 0 : null,
        x === 'W' ? margin : 0,
      ],
    }),
    y: css({
      background: color,
      width: 1,
      Absolute: [
        y === 'N' ? margin : 0,
        x === 'E' ? 0 : null,
        y === 'S' ? margin : 0,
        x === 'W' ? 0 : null,
      ],
    }),
  };

  return (
    <div {...css(props.style, styles.base)}>
      <div {...styles.x} />
      <div {...styles.y} />
    </div>
  );
};

/**
 * Helpers
 */

// function isHidden(x: 'W' | 'E', y: 'N' | 'S', hidden: CropmarkAddress[]) {
//   const isTop = y === 'N';
//   const isBottom = y === 'S';

//   return hidden.some((item) => {
//     if (item.top && isTop) return false;
//   });
// }
