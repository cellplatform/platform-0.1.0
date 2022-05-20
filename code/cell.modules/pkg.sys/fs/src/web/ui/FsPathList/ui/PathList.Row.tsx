import React from 'react';
import { FC, COLORS, Color, css, CssValue, t, Chip, Filesize } from '../common';

const TRANSPARENT = Color.format(0);

export type RowProps = {
  index: number;
  file: t.ManifestFile;
  is: t.ListItemRenderFlags;
  theme: t.PathListTheme;
  style?: CssValue;
};

const View: React.FC<RowProps> = (props) => {
  const { file, is, theme } = props;

  const path = file.path;
  const size = Filesize(file.bytes, { round: 1, spacer: '' });
  const selectedBorder = Color.alpha(COLORS.DARK, 0.1);
  const isLight = theme === 'Light';

  /**
   * [Render]
   */
  const styles = {
    base: {
      position: 'relative',
      boxSizing: 'border-box',
      fontSize: 12,
      color: isLight ? COLORS.DARK : Color.format(0.8),
      border: `solid 1px ${TRANSPARENT}`,

      padding: 2,
      paddingLeft: 4,
      marginLeft: 2,

      Flex: 'horizontal-stretch-spaceBetween',
    },
    selected: is.selected && {
      backgroundColor: Color.alpha(COLORS.BLUE, 0.15),
      borderRadius: selectedBorderRadius(is, 4),
      borderLeftColor: selectedBorder,
      borderRightColor: selectedBorder,
      borderTopColor: is.previous()?.selected ? undefined : selectedBorder,
      borderBottomColor: is.next()?.selected ? undefined : selectedBorder,
    },
    path: {
      base: css({
        flex: 1,
        position: 'relative',
        paddingTop: 1,
        display: 'flex',
      }),
      ellipsis: css({
        Absolute: 0,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }),
    },
  };

  return (
    <div {...css(styles.base, styles.selected, props.style)}>
      <div {...styles.path.base}>
        <div {...styles.path.ellipsis}>{path}</div>
      </div>
      <Chip.Hash
        text={file.filehash}
        prefix={size}
        clipboard={(e) => `${path}#${e.hash}`}
        length={4}
        theme={theme}
      />
    </div>
  );
};

/**
 * Export
 */

type Fields = { height: number };
export const Row = FC.decorate<RowProps, Fields>(
  View,
  { height: 20 },
  { displayName: 'PathList.Row' },
);

/**
 * Helpers
 */

function selectedBorderRadius(is: t.ListItemRenderFlags, radius: number) {
  const top = is.previous()?.selected ? 0 : radius;
  const bottom = is.next()?.selected ? 0 : radius;
  return `${top}px ${top}px ${bottom}px ${bottom}px `;
}
