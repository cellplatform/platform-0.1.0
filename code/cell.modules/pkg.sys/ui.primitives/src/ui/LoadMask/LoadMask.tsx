import React from 'react';

import { Spinner } from '../Spinner';
import { Color, COLORS, css, CssValue, DEFAULT, FC, t } from './common';

type Pixels = number;

export type LoadMaskProps = {
  theme?: t.LoadMaskTheme;
  spinner?: boolean;
  outerTile?: boolean;
  blur?: Pixels;
  style?: CssValue;
};

/**
 * Component
 */
const View: React.FC<LoadMaskProps> = (props) => {
  const { theme = 'Light', outerTile = true, spinner = true } = props;
  const isDark = theme === 'Dark';
  const borderRadius = 13;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      pointerEvents: 'none',
    }),
    bg: css({
      Absolute: 0,
      backdropFilter: `blur(${props.blur ?? DEFAULT.BLUR}px)`,
    }),
    body: css({
      Absolute: 0,
      Flex: 'center-center',
    }),
    outerTile:
      outerTile &&
      css({
        backgroundColor: isDark ? Color.format(-0.2) : Color.format(0.3),
        padding: 50,
        borderRadius,
        backdropFilter: `blur(8px)`,
      }),
  };

  const elSpinner = spinner && (
    <div {...styles.outerTile}>
      <Spinner color={isDark ? COLORS.WHITE : COLORS.DARK} />
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.bg} />
      <div {...styles.body}>{elSpinner}</div>
    </div>
  );
};

/**
 * Export
 */

type Fields = {
  DEFAULT: typeof DEFAULT;
};
export const LoadMask = FC.decorate<LoadMaskProps, Fields>(
  View,
  { DEFAULT },
  { displayName: 'LoadMask' },
);
