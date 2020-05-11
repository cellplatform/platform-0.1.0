import { t, constants } from '../../common';

export const DARK = {
  BG: '#202634',
  BG_SELECTION: '#394050',
  BG_GUTTER: '#262C3A',
};

/**
 * Configure the editor theme.
 */
export function theme(monaco: t.IMonaco) {
  const themeData = require('monaco-themes/themes/Monokai.json') as t.IMonacoStandaloneThemeData;
  themeData.colors = {
    ...themeData.colors,

    // 'editor.foreground': '#F8F8F2',
    // 'editor.background': DARK.BG,
    // 'editor.selectionBackground': DARK.BG_SELECTION,
    // 'editor.lineHighlightBackground': DARK.BG_SELECTION,
    // 'editorCursor.foreground': '#F8F8F0',
    // 'editorWhitespace.foreground': '#3B3A32',
    // 'editorIndentGuide.activeBackground': '#9D550F',
    // 'editor.selectionHighlightBorder': '#222218',

    // 'editorGutter.background': DARK.BG_GUTTER,

    // 'scrollbarSlider.shadow': DARK.BG,
    // 'scrollbarSlider.background': DARK.BG,
    // 'scrollbarSlider.activeBackground': DARK.BG_GUTTER,
    // 'scrollbarSlider.hoverBackground': '#2B313E',
  };

  monaco.editor.defineTheme(constants.THEME.NAME, themeData);
}
