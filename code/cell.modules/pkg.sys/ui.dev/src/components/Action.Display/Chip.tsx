import React from 'react';
import { color, css, CssValue, t, COLORS } from '../../common';

export type LabelChipProps = { style?: CssValue };

export const LabelChip: React.FC<LabelChipProps> = (props) => {
  const styles = {
    base: css({
      display: 'inline-block',
      backgroundColor: COLORS.CLI.MAGENTA,
      color: COLORS.WHITE,
      fontSize: 9,
      border: `solid 1px ${color.format(-0.03)}`,
      boxSizing: 'border-box',
      borderRadius: 3,
      PaddingX: 4,
      paddingTop: 2,
      paddingBottom: 1,
    }),
  };
  return <div {...css(styles.base, props.style)}>{props.children}</div>;
};
