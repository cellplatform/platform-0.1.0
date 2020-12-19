import { t, constants } from '../../common';

/**
 * Configure the editor themes.
 */
export function defineThemes(api: t.IMonacoSingleton) {
  api.monaco.editor.defineTheme(constants.THEMES.INK, Themes.ink());
}

/**
 * Index of themes.
 */
export const Themes = {
  light() {
    return require('monaco-themes/themes/Chrome DevTools.json') as t.IMonacoStandaloneThemeData; // eslint-disable-line
  },

  dark() {
    return require('monaco-themes/themes/Monokai.json') as t.IMonacoStandaloneThemeData; // eslint-disable-line
  },

  ink() {
    const INK = {
      BG: {
        BASE: '#202634',
        SELECTION: '#394050',
        GUTTER: '#262C3A',
      },
    };

    const themeData = Themes.dark();
    themeData.colors = {
      ...themeData.colors,

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

    return themeData;
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
    const DARK: t.CodeEditorTheme[] = ['dark', 'ink'];
    return DARK.includes(name);
  },

  isLight(name: t.CodeEditorTheme) {
    const LIGHT: t.CodeEditorTheme[] = ['light'];
    return LIGHT.includes(name);
  },
};
