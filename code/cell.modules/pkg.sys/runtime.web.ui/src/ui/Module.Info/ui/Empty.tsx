import React from 'react';
import { Color, COLORS, css, CssValue } from '../common';

export type EmptyProps = {
  message?: string | JSX.Element;
  style?: CssValue;
};

export const Empty: React.FC<EmptyProps> = (props) => {
  const { message = 'Module not loaded.' } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative' }),
    label: css({
      color: Color.alpha(COLORS.DARK, 0.3),
      fontSize: 12,
      fontStyle: 'italic',
      textAlign: 'center',
      PaddingY: 6,
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      {typeof message === 'string' && <div {...styles.label}>{message}</div>}
      {typeof message !== 'string' && message}
    </div>
  );
};
