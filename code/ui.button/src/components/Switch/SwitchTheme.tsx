import { color, COLORS, t } from '../common';

const { GREEN, WHITE } = COLORS;

export class SwitchTheme {
  /**
   * [Static.Methods]
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

  public static toShadowCss(shadow: t.IShadow) {
    const { x, y, blur } = shadow;
    return `${x}px ${y}px ${blur}px 0 ${color.format(shadow.color)}`;
  }

  /**
   * [Static.Properties]
   */
  public static get LIGHT(): t.ISwitchTheme {
    const BASE: t.ISwitchTheme = {
      trackColor: { on: GREEN, off: -0.1, disabled: -0.1 },
      thumbColor: { on: WHITE, off: WHITE, disabled: WHITE },
      shadowColor: -0.35,
      disabledOpacity: 0.45,
    };

    return BASE;
  }

  public static get DARK(): t.ISwitchTheme {
    const BASE: t.ISwitchTheme = {
      trackColor: { on: GREEN, off: 0.2, disabled: 0.2 },
      thumbColor: { on: WHITE, off: WHITE, disabled: WHITE },
      shadowColor: -0.6,
      disabledOpacity: 0.3,
    };
    return BASE;
  }
}
