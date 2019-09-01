export const COLORS = {
  WHITE: '#FFF',
  DARK: '#293042', // Inky blue/black.
  BLUE: '#4B89FF',
};

const fadeSpeed = 300;
const SHELL = {
  tree: { root: undefined, current: undefined },
  body: {
    el: undefined,
    foreground: { color: COLORS.DARK, fadeSpeed },
    background: { color: '#F8F9FA', fadeSpeed },
  },
  sidepanel: {
    el: undefined,
    foreground: { color: COLORS.WHITE, fadeSpeed },
    background: { color: COLORS.DARK, fadeSpeed },
  },
};

export const DEFAULT = {
  STATE: { SHELL },
};
