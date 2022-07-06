import React from 'react';
import { Color, COLORS, css, CssValue, DEFAULT, FC, t } from './common';

export type DocBlocksProps = {
  blocks?: JSX.Element[];
  sizes?: t.DocLayoutSizes;
  tracelines?: boolean;
  padding?: t.DocBlocksPadding;
  blockSpacing?: t.DocBlocksSpacing;
  style?: CssValue;
  onBlockClick?: t.DocBlocksClickHandler;
};

/**
 * Component
 */
const View: React.FC<DocBlocksProps> = (props) => {
  const { tracelines = false, blocks = [], blockSpacing = {}, padding = {}, sizes } = props;
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
    }),
    inner: css({ position: 'relative' }),
    header: css({ height: PADDING.header }),
    footer: css({ height: PADDING.footer }),
    block: css({
      width: sizes?.column.width ?? DEFAULT.columnWidth,
      PaddingY: blockSpacing.y ?? DEFAULT.blockspacing.y,
      ':first-child': { paddingTop: 0 },
    }),
    tracelines: css({
      borderRight: traceBorder,
      borderLeft: traceBorder,
      borderBottom: traceBorder,
      ':last-child': { borderBottom: 'none' },
    }),
  };

  const elBlocks = blocks.map((el, index) => {
    const handleClick = () => props.onBlockClick?.({ index });
    const key = `block.${index}`;
    return (
      <div {...css(styles.block, styles.tracelines)} key={key} onClick={handleClick}>
        {el}
      </div>
    );
  });

  return (
    <div {...styles.base}>
      <div {...styles.inner}>
        {PADDING.header && <div {...css(styles.header, styles.tracelines)} />}
        {elBlocks}
        {PADDING.footer && <div {...css(styles.footer, styles.tracelines)} />}
      </div>
    </div>
  );
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
