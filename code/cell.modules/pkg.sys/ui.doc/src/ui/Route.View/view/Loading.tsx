import React from 'react';
import { COLORS, css, CssValue, DEFAULT, Spinner, t } from '../common';

type Pixels = number;

export type LoadingProps = {
  theme?: t.RouteViewTheme;
  blur?: Pixels;
  style?: CssValue;
};

export const Loading: React.FC<LoadingProps> = (props) => {
  const { theme = DEFAULT.THEME } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      flex: 1,
      position: 'relative',
      pointerEvents: 'none',
      Flex: 'center-center',
    }),
    bg: css({
      Absolute: 0,
      backdropFilter: `blur(${props.blur ?? 8}px)`,
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.bg} />
      <Spinner color={theme === 'Dark' ? COLORS.WHITE : COLORS.DARK} />
    </div>
  );
};
