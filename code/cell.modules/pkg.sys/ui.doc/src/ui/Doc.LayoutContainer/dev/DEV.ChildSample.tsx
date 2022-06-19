import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t } from '../../common';

export type DevChildSampleProps = {
  sizes?: t.DocLayoutSizes;
  style?: CssValue;
};

export const DevChildSample: React.FC<DevChildSampleProps> = (props) => {
  const { sizes } = props;
  if (!sizes) return null;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      flex: 1,
      Flex: 'x-stretch-stretch',
      backgroundColor: 1,
    }),
    edge: css({ flex: 1 }),
    column: css({
      boxSizing: 'border-box',
      width: sizes.column.width,
      backgroundColor: 'rgba(255, 0, 0, 0.03)' /* RED */,
      padding: 20,
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.edge} />
      <div {...styles.column}>
        center: {sizes?.column.width ?? '-'} x {sizes?.column.height ?? '-'} pixels
      </div>
      <div {...styles.edge} />
    </div>
  );
};
