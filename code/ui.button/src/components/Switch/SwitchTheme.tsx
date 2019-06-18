import { t, COLORS, R } from '../common';

/**
 * The base switch theme.
 */
const BASE: t.ISwitchTheme = {};

export class SwitchTheme {
  /**
   * [Static]
   */
  public static merge(theme: Partial<t.ISwitchTheme>, base: t.ISwitchTheme = BASE) {
    const res = R.mergeDeepRight(base, theme) as t.ISwitchTheme;
    return R.clone(res);
  }

  public static get BASE() {
    return R.clone(BASE);
  }
}
