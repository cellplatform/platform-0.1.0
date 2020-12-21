import React from 'react';
import { css, CssValue, t, color, COLORS } from '../../common';

export type TitleItemProps = {
  model: t.ActionItemTitle;
  style?: CssValue;
};

export const TitleItem: React.FC<TitleItemProps> = (props) => {
  const styles = {
    base: css({
      boxSizing: 'border-box',
      color: COLORS.DARK,
      PaddingY: 4,
      PaddingX: 8,
      fontSize: 14,
      opacity: 0.8,
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div>Title</div>
    </div>
  );
};
