import React from 'react';
import { css, CssValue, t, color, Format } from '../../common';

export type ItemHrProps = {
  namespace: string;
  bus: t.DevEventBus;
  model: t.ActionHr;
  style?: CssValue;
};

export const ItemHr: React.FC<ItemHrProps> = (props) => {
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
