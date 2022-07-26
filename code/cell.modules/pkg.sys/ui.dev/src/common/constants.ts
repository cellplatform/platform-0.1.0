import { Subject } from 'rxjs';
import { Runtime } from '@platform/cell.runtime';

import * as t from './types';

export const MODULE = {
  info: Runtime.module(), // the compiled __CELL__ constant used within this method.
};

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
export const DEFAULT = {
  UNTITLED,
  UNNAMED,
  get ACTIONS(): t.ActionsModel<any> {
    return {
      namespace: UNNAMED,
      items: [],
      ctx: {},
      env: { viaAction: {}, viaSubject: {} },
      redraw$: new Subject<void>(),
    };
  },
};

export const CSS = {
  HOST: 'sys-ui-dev-Host',
  ACTIONS: 'sys-ui-dev-Actions',
  MARKDOWN: 'sys-ui-dev-Markdown',
};
