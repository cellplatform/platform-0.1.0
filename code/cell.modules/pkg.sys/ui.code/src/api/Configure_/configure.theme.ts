import { t } from '../../common';

type T = { name: t.CodeEditorTheme; data: t.IMonacoStandaloneThemeData };

/**
 * Configure the editor themes.
 */
export function defineThemes(api: t.ICodeEditorSingleton) {
  const define = (theme: T) => {
    api.monaco.editor.defineTheme(theme.name, theme.data);
  };
  define(Themes.light());
  define(Themes.dark());
}

/**
 * Index of themes.
 */
export const Themes = {
  light(): T {
    const data = require('monaco-themes/themes/Chrome DevTools.json') as t.IMonacoStandaloneThemeData; // eslint-disable-line
    return { name: 'light', data };
  },

  dark(): T {
    const data = require('monaco-themes/themes/Monokai.json') as t.IMonacoStandaloneThemeData; // eslint-disable-line

    const INK = {
      BG: {
        BASE: '#202634',
        SELECTION: '#394050',
        GUTTER: '#262C3A',
      },
    };

    data.colors = {
      ...data.colors,

      'editor.foreground': '#F8F8F2',
      'editor.background': INK.BG.BASE,
      'editor.selectionBackground': INK.BG.SELECTION,
      'editor.lineHighlightBackground': INK.BG.SELECTION,
      'editorCursor.foreground': '#F8F8F0',
      'editorWhitespace.foreground': '#3B3A32',
      'editorIndentGuide.activeBackground': '#9D550F',
      'editor.selectionHighlightBorder': '#222218',

      'editorGutter.background': INK.BG.GUTTER,

      'scrollbarSlider.shadow': INK.BG.BASE,
      'scrollbarSlider.background': INK.BG.BASE,
      'scrollbarSlider.activeBackground': INK.BG.GUTTER,
      'scrollbarSlider.hoverBackground': '#2B313E',
    };

    return { name: 'dark', data };
  },
};

/**
 * Helpers for looking up and assessing themes.
 */
export const Theme = {
  byName(name: t.CodeEditorTheme) {
    if (typeof Themes[name] === 'function') {
      return Themes[name]();
    }
    throw new Error(`Theme '${name}' not supported.`);
  },

  isDark(name: t.CodeEditorTheme) {
    const DARK: t.CodeEditorTheme[] = ['dark'];
    return DARK.includes(name);
  },

  isLight(name: t.CodeEditorTheme) {
    const LIGHT: t.CodeEditorTheme[] = ['light'];
    return LIGHT.includes(name);
  },
};
