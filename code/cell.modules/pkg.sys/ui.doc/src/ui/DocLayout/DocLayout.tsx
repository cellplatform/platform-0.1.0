import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t, FC, MinSize, DEFAULT, R } from './common';
import { TooSmall } from './ui/TooSmall';

export type DocLayoutProps = {
  scrollable?: boolean;
  tracelines?: boolean;
  sizes?: Partial<t.DocLayoutSizes>;
  style?: CssValue;
  onResize?: t.MinSizeResizeEventHandler;
};

/**
 * Component
 */
const View: React.FC<DocLayoutProps> = (props) => {
  const { scrollable = true, tracelines = false } = props;

  const min = R.mergeDeepRight(DEFAULT.sizes, props.sizes || {});
  const traceBorder = `solid 1px ${Color.format(-0.06)}`;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      Absolute: 0,
      color: COLORS.DARK,
      boxSizing: 'border-box',
      Flex: 'y-stretch-center',
    }),
    block: {
      base: css({
        borderRight: traceBorder,
        borderLeft: traceBorder,
        minWidth: 400,
        PaddingY: 15,
      }),
    },
  };

  const elBlock = <div {...styles.block.base}>Hello</div>;

  const elBase = (
    <div {...styles.base}>
      {elBlock}
      {elBlock}
      {elBlock}
      {elBlock}
    </div>
  );

  return (
    <MinSize
      minWidth={min.doc.min.width}
      minHeight={min.doc.min.height}
      warningElement={(e) => <TooSmall is={e.is} size={e.size} />}
      style={props.style}
      onResize={props.onResize}
    >
      {elBase}
      {/* {elBase}
      {elBase} */}
    </MinSize>
  );
};

/**
 * Export
 */

type Fields = {
  DEFAULT: typeof DEFAULT;
};
export const DocLayout = FC.decorate<DocLayoutProps, Fields>(
  View,
  { DEFAULT },
  { displayName: 'DocLayout' },
);
