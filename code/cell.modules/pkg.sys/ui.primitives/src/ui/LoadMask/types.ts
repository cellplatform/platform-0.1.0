import * as t from '../../common/types';

type Pixels = number;
type Color = string | number;

export type LoadMaskTheme = 'Light' | 'Dark';

/**
 * The total background of the component (masking what it sits in front of).
 */
export type LoadMaskBgProp = { blur?: Pixels; color?: Color };

/**
 * The inner "tile" that contains a spinner or other status into.
 */
export type LoadMaskTileProp = {
  el?: JSX.Element | null;
  blur?: Pixels;
  padding?: number | [number, number] | [number, number, number, number];
  borderRadius?: number;
  backgroundColor?: Color;
  size?: LoadMaskTileSize;
};

export type LoadMaskTileSize = {
  width?: Pixels;
  height?: Pixels;
  minWidth?: Pixels;
  minHeight?: Pixels;
  maxWidth?: Pixels;
  maxHeight?: Pixels;
};

/**
 * Component.
 */
export type LoadMaskProps = {
  theme?: LoadMaskTheme;
  bg?: boolean | LoadMaskBgProp;
  tile?: boolean | LoadMaskTileProp;
  spinner?: boolean;
  style?: t.CssValue;
};
