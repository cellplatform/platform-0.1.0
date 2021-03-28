import { style, COLORS, R, t } from '../common';

const { GREEN, WHITE, BLUE } = COLORS;

export const SwitchTheme = {
  merge(base: t.ISwitchTheme, theme: Partial<t.ISwitchTheme>) {
    const res = R.mergeDeepRight(base, theme) as t.ISwitchTheme;
    return R.clone(res);
  },

  fromString(theme: t.SwitchThemeName) {
    switch (theme) {
      case 'LIGHT':
        return SwitchTheme.light;
      case 'DARK':
        return SwitchTheme.dark;
      default:
        throw new Error(`Theme name '${theme}' not supported.`);
    }
  },

  toShadowCss(shadow: t.CssShadow) {
    return style.toShadow(shadow);
  },

  get light() {
    const BASE: t.ISwitchTheme = {
      trackColor: { on: GREEN, off: -0.1, disabled: -0.1 },
      thumbColor: { on: WHITE, off: WHITE, disabled: WHITE },
      shadowColor: -0.35,
      disabledOpacity: 0.45,
    };
    return {
      default: BASE,
      green: BASE,
      blue: SwitchTheme.merge(BASE, { trackColor: { on: BLUE, off: -0.1, disabled: -0.1 } }),
    };
  },

  get dark() {
    const BASE: t.ISwitchTheme = {
      trackColor: { on: GREEN, off: 0.2, disabled: 0.2 },
      thumbColor: { on: WHITE, off: WHITE, disabled: WHITE },
      shadowColor: -0.6,
      disabledOpacity: 0.3,
    };
    return {
      default: BASE,
      green: BASE,
      blue: SwitchTheme.merge(BASE, { trackColor: { on: BLUE, off: 0.2, disabled: 0.2 } }),
    };
  },
};
