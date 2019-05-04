import { color, COLORS, t } from '../../common';

const formatColor = (value: number | string) => color.format(value) as string;

/**
 * The base button theme.
 */
export const BASE: t.IButtonTheme = {
  enabledColor: COLORS.BLUE,
  disabledColor: formatColor(-0.3),
  border: {},
};
