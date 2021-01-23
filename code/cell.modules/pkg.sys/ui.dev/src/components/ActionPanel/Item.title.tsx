import React from 'react';
import { css, CssValue, t, color, COLORS } from '../../common';

export type TitleItemProps = {
  bus: t.DevEventBus;
  model: t.DevActionItemTitle;
  style?: CssValue;
};

export const TitleItem: React.FC<TitleItemProps> = (props) => {
  const { model } = props;

  const styles = {
    base: css({
      boxSizing: 'border-box',
      color: COLORS.DARK,
      PaddingY: 4,
      PaddingX: 8,
      fontSize: 13,
      fontWeight: 600,
      opacity: 0.8,
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div>{model.text}</div>
    </div>
  );
};
