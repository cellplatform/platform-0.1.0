import React from 'react';
import { COLORS, css, CssValue, Spinner, t } from '../common';

export type LoadingProps = {
  theme: t.RouteViewTheme;
  style?: CssValue;
};

export const Loading: React.FC<LoadingProps> = (props) => {
  const { theme } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative', pointerEvents: 'none', Flex: 'center-center' }),
    bg: css({ Absolute: 0, backdropFilter: `blur(8px)` }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.bg} />
      <Spinner color={theme === 'Dark' ? COLORS.WHITE : COLORS.DARK} />
    </div>
  );
};
