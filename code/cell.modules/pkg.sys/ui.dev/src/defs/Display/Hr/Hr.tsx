import React from 'react';
import { color, css, Format, t } from '../common';

export type HrProps = {
  namespace: string;
  bus: t.EventBus;
  item: t.ActionHr;
};

export const Hr: React.FC<HrProps> = (props) => {
  const { item } = props;
  const margin = Format.toEdges(item.margin);

  const styles = {
    base: css({
      boxSizing: 'border-box',
      paddingTop: margin.top,
      paddingRight: margin.right,
      paddingBottom: margin.bottom,
      paddingLeft: margin.left,
    }),
    hr: css({
      height: item.height,
      backgroundColor: color.format(0 - item.opacity),
    }),
  };

  return (
    <div {...styles.base}>
      <div {...styles.hr} />
    </div>
  );
};
