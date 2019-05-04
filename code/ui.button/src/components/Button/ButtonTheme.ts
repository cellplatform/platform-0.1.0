import { R, color, COLORS, t } from '../../common';

const formatColor = (value: number | string) => color.format(value) as string;

/**
 * The base button theme.
 */
const BASE: t.IButtonTheme = {
  enabledColor: COLORS.BLUE,
  disabledColor: formatColor(-0.6),
  disabledOpacity: 0.3,
  border: {
    isVisible: false,
    thickness: 1,
    padding: [6, 15, 5, 15],
    radius: 3,
    color: formatColor(-0.2),
  },
};

/**
 * Merges the given them into the base.
 */
export function merge(theme: t.IButtonTheme) {
  return R.mergeDeepRight(BASE, theme);
}

export class ButtonTheme {
  /**
   * [Static]
   */
  public static merge(theme: Partial<t.IButtonTheme> = {}) {
    return R.mergeDeepRight(BASE, theme) as t.IButtonTheme;
  }

  public static get BASE() {
    return R.clone(BASE);
  }

  public static get BORDER() {
    const border: Partial<t.IButtonThemeBorder> = { isVisible: true };
    const BASE = ButtonTheme.merge({ border: border as t.IButtonThemeBorder });
    return { BASE };
  }
}
