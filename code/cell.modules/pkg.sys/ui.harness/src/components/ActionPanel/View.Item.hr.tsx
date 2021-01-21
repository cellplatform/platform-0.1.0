import React from 'react';
import { css, CssValue, t, color } from '../../common';

export type HrItemProps = {
  model: t.ActionItemHr;
  style?: CssValue;
};

export const HrItem: React.FC<HrItemProps> = (props) => {
  const { model } = props;

  const styles = {
    base: css({
      boxSizing: 'border-box',
      PaddingX: 8,
      PaddingY: 8,
    }),
    hr: css({
      height: model.height,
      backgroundColor: color.format(0 - model.opacity),
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.hr} />
    </div>
  );
};
