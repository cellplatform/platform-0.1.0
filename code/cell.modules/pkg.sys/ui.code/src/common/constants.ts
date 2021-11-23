import * as t from './types';

export const LANGUAGES: t.CodeEditorLanguage[] = ['typescript', 'json'];

const MODEL: t.CodeEditorModel = {
  // filename: '',
  text: '',
  language: 'typescript',
  selection: {
    cursor: { line: 1, column: 1 },
    primary: { end: { line: 1, column: 1 }, start: { line: 1, column: 1 } },
    secondary: [],
  },
};

export const DEFAULT = {
  THEME: 'dark' as t.CodeEditorTheme,
  LANGUAGE: { TS: 'typescript' },
  MODEL,
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

export const PATH = {
  STATIC: {
    VS: 'static/vs',
    TYPES: {
      CELL: 'static/types.d/lib.cell',
      ES: 'static/types.d/lib.es',
    },
  },
};
