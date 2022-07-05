import React from 'react';
import { Color, COLORS, css, CssValue, DEFAULT, FC, t } from './common';

export type DocBlocksProps = {
  blocks?: JSX.Element[];
  sizes?: t.DocLayoutSizes;
  scrollable?: boolean;
  tracelines?: boolean;
  padding?: {
    header?: boolean | number;
    footer?: boolean | number;
  };
  blockSpacing?: { y?: number };
  style?: CssValue;
  onBlockClick?: t.DocLayoutBlockClickHandler;
};

/**
 * Component
 */
const View: React.FC<DocBlocksProps> = (props) => {
  const {
    scrollable = true,
    tracelines = false,
    blocks = [],
    blockSpacing = {},
    padding = {},
    sizes,
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
      Scroll: scrollable,
      paddingTop: PADDING.header,
      paddingBottom: PADDING.footer,
      Flex: 'y-stretch-center',
    }),
    block: {
      base: css({
        width: sizes?.column.width ?? DEFAULT.columnWidth,
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
        {...styles.block.base}
        key={`block.${index}`}
        onClick={() => props.onBlockClick?.({ index })}
      >
        {el}
      </div>
    );
  });

  return <div {...styles.base}>{elBlocks}</div>;
};

/**
 * Export
 */

type Fields = {
  DEFAULT: typeof DEFAULT;
};
export const DocBlocks = FC.decorate<DocBlocksProps, Fields>(
  View,
  { DEFAULT },
  { displayName: 'Doc.Blocks' },
);
