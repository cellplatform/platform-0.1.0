import * as t from './types';

export const COLORS = {
  WHITE: '#FFF',
  DARK: '#293042', // Inky blue/black.
  BLUE: '#4B89FF',
};

const fadeSpeed = 300;
const SHELL = {
  tree: {
    root: undefined,
    current: undefined,
    width: { value: 250, speed: 200 },
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
};

export const DEFAULT = {
  STATE: { SHELL },
};
