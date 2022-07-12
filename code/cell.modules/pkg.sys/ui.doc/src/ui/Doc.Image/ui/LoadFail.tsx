import React from 'react';
import { Color, COLORS, css, CssValue, Icons } from '../common';

export type LoadFailProps = {
  url?: string;
  message?: string;
  borderRadius?: number;
  height?: number;
  style?: CssValue;
};

export const LoadFail: React.FC<LoadFailProps> = (props) => {
  const { borderRadius, height } = props;
  const message = props.message ?? 'Failed to load image.';

  /**
   * [Render]
   */
  const styles = {
    base: css({
      boxSizing: 'border-box',
      backgroundColor: Color.alpha(COLORS.DARK, 0.03),
      border: `solid 1px ${Color.alpha(COLORS.DARK, 0.1)}`,
      borderRadius,
      padding: 20,
      userSelect: 'none',
      height,
    }),
    body: css({ Flex: 'x-spaceBetween-center' }),
    message: css({
      color: COLORS.DARK,
      fontSize: 14,
      fontStyle: 'italic',
      opacity: 0.4,
      PaddingX: 15,
    }),
  };

  const elIcon = <Icons.Image.Fail color={COLORS.DARK} opacity={0.3} />;

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.body}>
        {elIcon}
        <div {...styles.message}>{message}</div>
        {elIcon}
      </div>
    </div>
  );
};
