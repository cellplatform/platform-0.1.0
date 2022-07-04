import * as t from '../../common/types';
export * from '../common';

const THEMES: t.LoadMaskTheme[] = ['Light', 'Dark'];
const MASK: Required<t.LoadMaskBgProp> = { blur: 8, color: 0 };
const TILE: Required<t.LoadMaskTileProp> = {
  el: null,
  blur: 15,
  padding: 50,
  backgroundColor: -1,
  borderColor: -1,
  borderRadius: 8,
  size: {},
};

export const DEFAULT = {
  THEMES,
  THEME: THEMES[0],
  MASK,
  TILE,
};
