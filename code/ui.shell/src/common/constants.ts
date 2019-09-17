import * as t from './types';
import { color as colorUtil } from './libs';

const asColor = (value: number) => colorUtil.format(value) as string;

export const COLORS = {
  WHITE: '#FFF',
  DARK: '#293042', // Inky blue/black.
  BLUE: '#4B89FF',
  TRANSPARENT: 'transparent',
};

const fadeSpeed = 300;
const SHELL = {
  header: {
    el: undefined,
    height: { value: 0, speed: 100 },
    foreground: { color: COLORS.WHITE, fadeSpeed },
    background: { color: COLORS.DARK, fadeSpeed },
    border: { color: asColor(0.1), fadeSpeed },
  },
  tree: {
    root: undefined,
    current: undefined,
    width: { value: 250, speed: 200 },
    render: undefined,
  },
  body: {
    el: undefined,
    foreground: { color: COLORS.DARK, fadeSpeed },
    background: { color: '#F8F9FA', fadeSpeed },
  },
  sidebar: {
    el: undefined,
    foreground: { color: COLORS.WHITE, fadeSpeed },
    background: { color: COLORS.DARK, fadeSpeed },
    width: { value: 300, speed: 200 },
  },
  footer: {
    el: undefined,
    height: { value: 28, speed: 100 },
    foreground: { color: COLORS.WHITE, fadeSpeed },
    background: { color: COLORS.TRANSPARENT, fadeSpeed },
    border: { color: asColor(0.1), fadeSpeed },
  },
};

export const DEFAULT = {
  STATE: { SHELL },
};
