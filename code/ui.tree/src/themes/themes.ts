import { color as colorUtil, COLORS } from '../common';
import { ITreeTheme } from './types';

const color = (value: number) => colorUtil.format(value) as string;

export const LIGHT: ITreeTheme = {
  name: 'LIGHT',
  bg: COLORS.WHITE,
  borderColor: color(-0.1),
  spinner: COLORS.BLACK,
  header: {
    bg: colorUtil
      .create(COLORS.WHITE)
      .darken(2)
      .toHexString(),
    titleColor: color(-0.5),
    borderBottomColor: color(-0.08),
    textShadow: 1,
    chevronColor: color(-0.5),
  },
  node: {
    labelColor: color(-0.5),
    chevronColor: color(-0.5),
    borderTopColor: color(-0.06),
    borderBottomColor: color(-0.06),
    statusBadge: {
      color: color(1),
      bgColor: color(-0.24),
      borderColor: color(-0.05),
      textShadow: color(-0.1),
    },
    selected: {
      bgColor: color(-0.05),
    },
  },
};

export const DARK: ITreeTheme = {
  name: 'DARK',
  bg: COLORS.DARK,
  borderColor: color(0.2),
  spinner: COLORS.WHITE,
  header: {
    bg: colorUtil
      .create(COLORS.DARK)
      .darken(4)
      .toHexString(),
    titleColor: color(0.8),
    borderBottomColor: color(0.3),
    textShadow: -1,
    chevronColor: color(0.7),
  },
  node: {
    labelColor: color(0.7),
    chevronColor: color(0.7),
    borderTopColor: color(0.1),
    borderBottomColor: color(0.1),
    statusBadge: {
      color: color(1),
      bgColor: color(0.2),
      borderColor: color(0.1),
      textShadow: color(-0.2),
    },
    selected: {
      bgColor: color(0.08),
    },
  },
};
