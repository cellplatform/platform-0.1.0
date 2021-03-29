import * as t from './types';
import { R } from './libs';

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
    PINK: '#FF0067',
  },
};

const UNNAMED = 'Unnamed';
const UNTITLED = 'Untitled';
const ACTIONS: t.ActionsModel<any> = {
  namespace: UNNAMED,
  items: [],
  ctx: {},
  env: { viaAction: {}, viaSubject: {} },
};
export const DEFAULT = {
  UNTITLED,
  UNNAMED,
  get ACTIONS() {
    return R.clone(ACTIONS);
  },
};

export const CSS = {
  HOST: 'dev-Host',
  ACTIONS: 'dev-Actions',
  MARKDOWN: 'dev-Markdown',
};
