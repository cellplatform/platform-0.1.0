import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../../common';

export type SampleGridProps = { style?: CssValue };

export const SampleGrid: React.FC<SampleGridProps> = (props) => {
  const styles = {
    base: css({
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      width: 500,
      // height: 400,
      display: 'grid',
      gridTemplateColumns: `[bullet] 30px [body] auto`,
    }),
    item: css({
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      border: `solid 1px ${color.format(-0.1)}`,
      margin: 3,
      minHeight: 30,
      minWidth: 60,
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.item}></div>
      <div {...styles.item}></div>
      <div {...styles.item}></div>
      <div {...styles.item}></div>
      <div {...styles.item}></div>
    </div>
  );
};
