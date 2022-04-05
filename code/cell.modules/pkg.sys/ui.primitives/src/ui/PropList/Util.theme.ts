import { color, COLORS, DEFAULT, t } from './common';

export function theme(input?: t.PropListTheme) {
  const value = input ?? DEFAULT.THEME;

  const is = {
    light: value === 'Light',
    dark: value === 'Dark',
  };

  const theme = {
    value,
    is,
    color: {
      base: is.light ? COLORS.DARK : COLORS.WHITE,
      alpha: (opacity: number) => color.alpha(theme.color.base, opacity),
    },
  };

  return theme;
}
