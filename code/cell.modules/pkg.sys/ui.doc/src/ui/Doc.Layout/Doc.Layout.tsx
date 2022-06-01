import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t, FC, MinSize, R } from './common';
import { TooSmall } from './ui/TooSmall';

export type DocLayoutProps = {
  scrollable?: boolean;
  tracelines?: boolean;
  blocks?: JSX.Element[];
  style?: CssValue;
  onResize?: t.MinSizeResizeEventHandler;
};

/**
 * Component
 */
const View: React.FC<DocLayoutProps> = (props) => {
  const { scrollable = true, tracelines = false, blocks = [] } = props;

  // const min = R.mergeDeepRight(DEFAULT.sizes, props.sizes || {});
  const traceBorder = `solid 1px ${Color.alpha(COLORS.MAGENTA, tracelines ? 0.1 : 0)}`;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      Absolute: 0,
      color: COLORS.DARK,
      boxSizing: 'border-box',
      Flex: 'y-stretch-center',
      Scroll: scrollable,
      paddingBottom: 120,
    }),
    block: {
      base: css({
        borderRight: traceBorder,
        borderLeft: traceBorder,
        width: 720,
        PaddingY: 15,
      }),
    },
  };

  const elBlocks = blocks.map((el, i) => {
    return (
      <div key={`block.${i}`} {...styles.block.base}>
        {el}
      </div>
    );
  });

  const elBase = <div {...styles.base}>{elBlocks}</div>;

  return (
    <MinSize
      minWidth={300}
      // minHeight={min.doc.min.height}
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
  // DEFAULT: typeof DEFAULT;
};
export const DocLayout = FC.decorate<DocLayoutProps, Fields>(
  View,
  // { DEFAULT },
  { displayName: 'Doc.Layout' },
);
