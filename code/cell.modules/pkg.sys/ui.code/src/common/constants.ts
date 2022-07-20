import * as t from './types';

export const LANGUAGES: t.CodeEditorLanguage[] = ['typescript', 'javascript', 'json', 'markdown'];

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
      ES: 'static/types.d/lib.es',
      SYS: 'static/types.d/lib.sys',
    },
  },
};

export const DEFAULT = {
  THEME: <t.CodeEditorTheme>'dark',
  LANGUAGE: { TS: <t.CodeEditorLanguage>'typescript' },
  PATH,
  MODEL: <t.CodeEditorModel>{
    text: '',
    language: 'typescript',
    selection: {
      cursor: { line: 1, column: 1 },
      primary: { end: { line: 1, column: 1 }, start: { line: 1, column: 1 } },
      secondary: [],
    },
  },
};
