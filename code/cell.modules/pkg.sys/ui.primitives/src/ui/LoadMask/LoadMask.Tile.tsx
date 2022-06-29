import React from 'react';
import { Color, css, CssValue, DEFAULT, Style, t } from './common';

export type LoadMaskTileProps = {
  theme: t.LoadMaskTheme;
  tile: t.LoadMaskTileProp;
  style?: CssValue;
};

const TILE = DEFAULT.TILE;

export const LoadMaskTile: React.FC<LoadMaskTileProps> = (props) => {
  const { tile } = props;
  const size = tile.size ?? {};

  /**
   * [Render]
   */
  const styles = {
    base: css({
      Flex: 'y-center-center',
      boxSizing: 'border-box',
      backgroundColor: toBackgroundColor(props),
      borderRadius: tile.borderRadius ?? TILE.borderRadius,
      backdropFilter: `blur(${tile.blur ?? TILE.blur}px)`,
      width: size.width,
      minWidth: size.minWidth,
      minHeight: size.minHeight,
      maxWidth: size.maxWidth,
      maxHeight: size.maxHeight,
      ...Style.toPadding(tile.padding ?? TILE.padding),
    }),
    children: css({ Flex: 'center-center' }),
  };

  const elChildren = props.children && <div {...styles.children}>{props.children}</div>;

  return (
    <div {...css(styles.base, props.style)}>
      {elChildren}
      {tile.el}
    </div>
  );
};

/**
 * Helpers
 */

function toBackgroundColor(props: LoadMaskTileProps) {
  const { theme, tile } = props;
  const isDark = theme === 'Dark';
  return tile.backgroundColor === undefined || tile.backgroundColor < 0
    ? Color.format(isDark ? 0.1 : -0.05)
    : Color.format(tile.backgroundColor);
}
