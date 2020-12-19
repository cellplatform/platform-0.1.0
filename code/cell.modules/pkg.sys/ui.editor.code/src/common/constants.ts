import * as t from './types';

export const THEMES = {
  INK: 'ink' as t.CodeEditorTheme,
};

export const DEFAULT = {
  THEME: THEMES.INK,
  LANGUAGE: {
    TS: 'typescript',
  },
};

export const COLORS = {
  WHITE: '#fff',
  DARK: '#293042', // Inky blue/black.
  BLUE: '#4B89FF',
};
