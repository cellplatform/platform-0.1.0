import React from 'react';
import { color, css, CssValue, t, COLORS } from '../../common';
import { Icons } from '../../Icons';

export type ExportLabelProps = {
  text?: string;
  style?: CssValue;
};

export const ExportLabel: React.FC<ExportLabelProps> = (props) => {
  const height = 14;

  const styles = {
    base: css({
      Flex: 'horizontal-center-center',
      paddingLeft: 8,
      height,
    }),
    prefix: css({
      marginLeft: 6,
      fontSize: 9,
      fontWeight: 600,
      PaddingX: 4,
      paddingTop: 2,
      paddingBottom: 1,
      backgroundColor: color.alpha(COLORS.DARK, 0.08),
      border: `solid 1px ${color.format(-0.06)}`,
      borderRadius: 2,
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <Icons.Extension size={height} />
      {props.text && <div {...styles.prefix}>{props.text}</div>}
    </div>
  );
};
