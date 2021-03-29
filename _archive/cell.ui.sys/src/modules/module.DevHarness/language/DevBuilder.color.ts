import { color as colorUtil, defaultValue, t } from '../common';

export const COLORS = {
  INK: '293042',
  WHITE: 'FFF',
  BLACK: '000',
  RED: 'FF0000',
  MAGENTA: 'FE0168',
  CYAN: '00B2FF',
  GREEN: '31B84D',
  YELLOW: 'FFAB0A',
};

export function deriveColor(
  fn: t.DevBuilderColorEditor,
  defaults: { color?: string; opacity?: number } = {},
) {
  const color = colorEditor(defaults);
  fn(color.args);
  return color.toString();
}

export function colorEditor(defaults: { color?: string; opacity?: number } = {}) {
  let count = 0;

  let color = colorUtil
    .create(defaults.color || COLORS.INK)
    .setAlpha(defaultValue(defaults.opacity, 1));

  const alpha = (opacity?: number) => {
    count++;
    color.setAlpha(defaultValue(opacity, 1));
    return args;
  };

  const format = (value: string | number, opacity?: number) => {
    count++;
    value = typeof value === 'string' ? value : (colorUtil.format(value) as string);
    color = colorUtil.create(value);
    return alpha(opacity);
  };

  const args: t.DevBuilderColor = {
    opacity: (value) => alpha(value),
    color: (value) => format(value),
    INK: (opacity) => format(COLORS.INK, opacity),
    WHITE: (opacity) => format(COLORS.WHITE, opacity),
    BLACK: (opacity) => format(COLORS.BLACK, opacity),
    RED: (opacity) => format(COLORS.RED, opacity),
    MAGENTA: (opacity) => format(COLORS.MAGENTA, opacity),
    CYAN: (opacity) => format(COLORS.CYAN, opacity),
    GREEN: (opacity) => format(COLORS.GREEN, opacity),
    YELLOW: (opacity) => format(COLORS.YELLOW, opacity),
  };

  return {
    args,
    get changed() {
      return count > 0;
    },
    toString: () => color.toPercentageRgbString(),
  };
}
