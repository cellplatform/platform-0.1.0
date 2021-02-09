import React from 'react';
import { COLORS, css, CssValue, t } from '../../common';

export type ItemTitleProps = {
  namespace: string;
  bus: t.EventBus;
  model: t.ActionTitle;
  style?: CssValue;
};

export const ItemTitle: React.FC<ItemTitleProps> = (props) => {
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
