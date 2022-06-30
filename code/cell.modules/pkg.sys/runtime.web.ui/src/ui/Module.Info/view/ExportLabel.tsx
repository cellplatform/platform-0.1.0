import React from 'react';

import { Icons } from '../../Icons';
import { Color, COLORS, css, CssValue, t } from '../common';

export type ExportLabelProps = {
  text: string;
  theme: t.ModuleInfoTheme;
  style?: CssValue;
};

export const ExportLabel: React.FC<ExportLabelProps> = (props) => {
  const { theme } = props;

  const height = 14;
  const isDark = theme === 'Dark';

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
      backgroundColor: isDark ? Color.format(0.1) : Color.alpha(COLORS.DARK, 0.08),
      border: `solid 1px ${Color.format(isDark ? 0.04 : -0.06)}`,
      borderRadius: 2,
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <Icons.Extension size={height} color={isDark ? 0.8 : Color.alpha(COLORS.DARK, 0.4)} />
      {props.text && <div {...styles.prefix}>{props.text}</div>}
    </div>
  );
};
