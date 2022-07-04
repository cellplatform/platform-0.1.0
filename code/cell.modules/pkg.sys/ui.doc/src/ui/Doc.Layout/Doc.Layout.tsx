import React from 'react';
import { Color, COLORS, css, CssValue, DEFAULT, FC, MinSize, t } from './common';
import { DocTooSmall } from '../Doc.TooSmall';

export type DocLayoutProps = {
  scrollable?: boolean;
  tracelines?: boolean;
  blocks?: JSX.Element[];
  padding?: {
    header?: boolean | number;
    footer?: boolean | number;
  };
  blockSpacing?: { y?: number };
  style?: CssValue;
  onResize?: t.MinSizeResizeEventHandler;
  onBlockClick?: t.DocLayoutBlockClickHandler;
};

/**
 * Component
 */
const View: React.FC<DocLayoutProps> = (props) => {
  const {
    scrollable = true,
    tracelines = false,
    blocks = [],
    blockSpacing = {},
    padding = {},
  } = props;

  const traceBorder = `solid 1px ${Color.alpha(COLORS.MAGENTA, tracelines ? 0.1 : 0)}`;

  const PADDING = {
    header: padding.header === true ? DEFAULT.padding.header : padding.header,
    footer: padding.footer === true ? DEFAULT.padding.footer : padding.footer,
  };

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
      paddingTop: PADDING.header,
      paddingBottom: PADDING.footer,
    }),
    block: {
      base: css({
        width: 720,
        PaddingY: blockSpacing.y ?? DEFAULT.blockspacing.y,
        ':first-child': { paddingTop: 0 },

        // Debug (tracelines).
        borderRight: traceBorder,
        borderLeft: traceBorder,
        borderBottom: traceBorder,
        ':last-child': { borderBottom: 'none' },
      }),
    },
  };

  const elBlocks = blocks.map((el, index) => {
    return (
      <div
        key={`block.${index}`}
        {...styles.block.base}
        onClick={() => props.onBlockClick?.({ index })}
      >
        {el}
      </div>
    );
  });

  const elBase = <div {...styles.base}>{elBlocks}</div>;

  return (
    <MinSize
      minWidth={300}
      warningElement={(e) => <DocTooSmall is={e.is} size={e.size} />}
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
