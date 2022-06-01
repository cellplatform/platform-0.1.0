import React, { useEffect, useRef, useState } from 'react';

import { Color, COLORS, css, CssValue, DEFAULT, FC, MinSize, t } from './common';
import { TooSmall } from './ui/TooSmall';

export type DocLayoutProps = {
  scrollable?: boolean;
  tracelines?: boolean;
  blocks?: JSX.Element[];
  footerPadding?: boolean | number;
  blockSpacing?: { y?: number };
  style?: CssValue;
  onResize?: t.MinSizeResizeEventHandler;
};

/**
 * Component
 */
const View: React.FC<DocLayoutProps> = (props) => {
  const { scrollable = true, tracelines = false, blocks = [], blockSpacing = {} } = props;

  const traceBorder = `solid 1px ${Color.alpha(COLORS.MAGENTA, tracelines ? 0.1 : 0)}`;
  const footerPadding = props.footerPadding === true ? DEFAULT.footerPadding : props.footerPadding;

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
      paddingBottom: footerPadding,
    }),
    block: {
      base: css({
        width: 720,
        PaddingY: blockSpacing.y ?? DEFAULT.blockspacing.y,
        ':first-child': { paddingTop: 0 },

        // Debug (tracelines)
        borderRight: traceBorder,
        borderLeft: traceBorder,
        borderBottom: traceBorder,
        ':last-child': { borderBottom: 'none' },
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
      warningElement={(e) => <TooSmall is={e.is} size={e.size} />}
      style={props.style}
      onResize={props.onResize}
    >
      {elBase}
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
  { displayName: 'Doc.Layout' },
);
