import * as t from '../../common/types';
export * from '../../common';

export const THEMES: t.LoadMaskTheme[] = ['Light', 'Dark'];
export const DEFAULT = {
  THEMES,
  THEME: THEMES[0],
  BLUR: 8,
};
