import React from 'react';
import { css, CssValue, t, color, Format } from '../../common';

export type HrItemProps = {
  model: t.DevActionItemHr;
  style?: CssValue;
};

export const HrItem: React.FC<HrItemProps> = (props) => {
  const { model } = props;
  const margin = Format.toEdges(model.margin);

  const styles = {
    base: css({
      boxSizing: 'border-box',
      paddingTop: margin.top,
      paddingRight: margin.right,
      paddingBottom: margin.bottom,
      paddingLeft: margin.left,
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
