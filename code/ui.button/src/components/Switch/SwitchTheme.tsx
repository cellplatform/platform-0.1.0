import { COLORS, t } from '../common';

export class SwitchTheme {
  /**
   * [Static]
   */
  public static fromString(theme: t.SwitchThemeName) {
    switch (theme) {
      case 'LIGHT':
        return SwitchTheme.LIGHT;
      case 'DARK':
        return SwitchTheme.DARK;
      default:
        throw new Error(`Theme name '${theme}' not supported.`);
    }
  }

  public static get LIGHT(): t.ISwitchTheme {
    return {
      trackColor: {
        on: COLORS.GREEN,
        off: -0.1,
      },
    };
  }

  public static get DARK(): t.ISwitchTheme {
    return {
      trackColor: {
        on: COLORS.GREEN,
        off: 0.2,
      },
    };
  }
}
