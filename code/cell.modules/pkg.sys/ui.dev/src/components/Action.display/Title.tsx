import React from 'react';

import { COLORS, css, t } from '../common';

export type TitleProps = {
  namespace: string;
  bus: t.EventBus;
  item: t.ActionTitle;
};

export const Title: React.FC<TitleProps> = (props) => {
  const { item } = props;

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
    <div {...styles.base}>
      <div>{item.text}</div>
    </div>
  );
};
