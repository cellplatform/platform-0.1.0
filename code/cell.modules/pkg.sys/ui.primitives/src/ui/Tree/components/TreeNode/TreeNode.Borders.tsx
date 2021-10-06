import React from 'react';
import { t, color, css, CssValue, themes } from './common';

export type TreeNodeBordersProps = {
  theme: t.ITreeNodeTheme;
  colors: t.ITreeviewNodeColors;
  isFirst: boolean;
  style?: CssValue;
};

export const TreeNodeBorders: React.FC<TreeNodeBordersProps> = (props) => {
  const { theme, colors, isFirst } = props;

  type Color = string | number | boolean | undefined;
  let topColor: Color;
  let bottomColor: Color;

  if (colors.borderTop !== undefined) {
    topColor = colors.borderTop;
  } else if (isFirst || colors.bg) {
    topColor = false;
  }

  if (colors.borderBottom !== undefined) {
    bottomColor = colors.borderBottom;
  }

  topColor = themes.color(topColor, theme.borderTopColor);

  const styles = {
    top: css({
      Absolute: [0, 0, null, 0],
      height: 1,
      borderTop: `solid 1px ${color.format(topColor)}`,
    }),
    bottom: css({
      Absolute: [null, 0, 0, 0],
      height: 1,
      borderBottom: `solid 1px ${color.format(bottomColor)}`,
    }),
  };
  return (
    <>
      <div {...styles.top} />
      <div {...styles.bottom} />
    </>
  );
};
