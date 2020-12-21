import React from 'react';
import { css, CssValue, t, color } from '../../common';

export type ItemTitleProps = {
  model: t.ActionItemHr;
  style?: CssValue;
};

export const ItemTitle: React.FC<ItemTitleProps> = (props) => {
  const styles = {
    base: css({
      // boxSizing: 'border-box',
      // PaddingY: 4,
      // PaddingX: 8,
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div>Title</div>
    </div>
  );
};
