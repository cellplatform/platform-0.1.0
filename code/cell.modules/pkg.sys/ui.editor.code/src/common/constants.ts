import * as t from './types';

const MODEL: t.CodeEditorModel = {
  filename: '',
  text: '',
  selection: {
    position: { line: 1, column: 1 },
    primary: { end: { line: 1, column: 1 }, start: { line: 1, column: 1 } },
    secondary: [],
  },
};

export const DEFAULT = {
  THEME: 'ink' as t.CodeEditorTheme,
  LANGUAGE: { TS: 'typescript' },
  MODEL,
};

export const COLORS = {
  WHITE: '#fff',
  DARK: '#293042', // Inky blue/black.
  BLUE: '#4B89FF',
};
