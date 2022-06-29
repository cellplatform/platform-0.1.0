import React from 'react';

import { Spinner } from '../Spinner';
import { t, Color, COLORS, css, DEFAULT, FC } from './common';
import { LoadMaskProps } from './types';
import { LoadMaskTile } from './LoadMask.Tile';

export { LoadMaskProps };

/**
 * Component
 */
const View: React.FC<LoadMaskProps> = (props) => {
  const { theme = 'Light', spinner = true } = props;
  const isDark = theme === 'Dark';
  const mask = toBgProp(props.bg);
  const tile = toTileProp(props.tile);

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative', pointerEvents: 'none' }),
    mask: css({
      Absolute: 0,
      backdropFilter: mask ? `blur(${mask.blur}px)` : undefined,
      backgroundColor: Color.format(mask.color),
    }),
    body: css({ Absolute: 0, Flex: 'center-center' }),
  };

  const elSpinner = spinner && <Spinner color={isDark ? COLORS.WHITE : COLORS.DARK} />;

  const elTile = tile && (
    <LoadMaskTile theme={theme} tile={tile}>
      {elSpinner}
    </LoadMaskTile>
  );

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.mask} />
      <div {...styles.body}>
        {!elTile && elSpinner}
        {elTile}
      </div>
    </div>
  );
};

/**
 * Helpers
 */

function toBgProp(input: LoadMaskProps['bg']): t.LoadMaskBgProp {
  if (input === false) return { blur: 0, color: 0 };
  if (input === undefined || input === true) return DEFAULT.MASK;
  return input;
}

function toTileProp(input: LoadMaskProps['tile']): t.LoadMaskTileProp | undefined {
  if (input === false) return undefined;
  if (input === undefined || input === true) return DEFAULT.TILE;
  return input;
}

/**
 * Export
 */

type Fields = {
  DEFAULT: typeof DEFAULT;
  toBgProp: typeof toBgProp;
  toTileProp: typeof toTileProp;
};
export const LoadMask = FC.decorate<LoadMaskProps, Fields>(
  View,
  { DEFAULT, toBgProp, toTileProp },
  { displayName: 'LoadMask' },
);
