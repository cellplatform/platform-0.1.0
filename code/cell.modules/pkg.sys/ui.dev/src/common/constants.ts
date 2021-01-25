import * as t from './types';

export const FONT = {
  MONO: 'Menlo, monospace',
  SANS: 'sans-serif',
};

export const COLORS = {
  WHITE: '#fff',
  DARK: '#293042', // Inky blue/black.
  BLUE: '#4B89FF',
  CLI: {
    BLUE: '#477AF7',
    YELLOW: '#FBC72F',
    MAGENTA: '#FE0064',
    CYAN: '#67D9EF',
    LIME: '#A6E130',
    DARK_RED: '#CB352F',
    PURPLE: '#8F2298',
    PINK: '#DC6FEC',
  },
};

const UNNAMED = 'Unnamed';
const UNTITLED = 'Untitled';
const ACTIONS: t.DevActionsModel<any> = { ns: '', name: UNNAMED, items: [], ctx: {}, env: {} };
export const DEFAULT = {
  ACTIONS,
  UNTITLED,
  UNNAMED,
};
