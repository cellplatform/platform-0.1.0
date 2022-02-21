import * as React from 'react';

import { color, COLORS, Style, css, CssValue, defaultValue, t } from '../../common';

export type HrProps = {
  color?: string | number | 'MAGENTA' | 'CYAN';
  margin?: t.CssEdgesInput;
  dashed?: boolean;
  opacity?: number;
  thickness?: number;
  style?: CssValue;
};

export const Hr: React.FC<HrProps> = (props) => {
  const { dashed } = props;
  const thickness = defaultValue(props.thickness, 1);
  const opacity = defaultValue(props.opacity, 1);
  const margin = defaultValue(props.margin, [20, 0]);

  let borderColor = props.color;
  borderColor = borderColor === 'MAGENTA' ? COLORS.MAGENTA : borderColor;
  borderColor = borderColor === 'CYAN' ? COLORS.CYAN : borderColor;
  borderColor = color.format(borderColor || -1);

  const styles = {
    base: css({
      boxSizing: 'border-box',
      border: 'none',
      borderBottom: `${dashed ? 'dashed' : 'solid'} ${thickness}px ${borderColor}`,
      opacity,
      ...Style.toMargins(margin),
    }),
  };

  return <hr {...css(styles.base, props.style)} />;
};
