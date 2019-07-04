import { color as colorUtil, defaultValue } from '../common';
import { ITreeTheme, TreeTheme } from './types';
import { LIGHT, DARK } from './themes';

export * from './themes';
export * from './types';

/**
 * Derives a color value from a prop with fallback to theme.
 */
export function color(
  prop: number | string | boolean | undefined,
  theme: number | string | undefined,
) {
  const result = prop === true ? theme : prop === false ? 'transparent' : defaultValue(prop, theme);
  return colorUtil.format(result);
}

/**
 * Retrieves the theme from component props, or the default theme.
 */
export function themeOrDefault(props: { theme?: ITreeTheme | TreeTheme }) {
  return props.theme === undefined ? LIGHT : toTheme(props.theme);
}

export function toTheme(name: TreeTheme | ITreeTheme) {
  if (typeof name === 'object') {
    return name;
  }
  switch (name) {
    case 'LIGHT':
      return LIGHT;
    case 'DARK':
      return DARK;

    default:
      throw new Error(`Theme '${name}' not supported.`);
  }
}
