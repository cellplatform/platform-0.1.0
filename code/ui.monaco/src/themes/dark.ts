import { monaco } from '../common';

/**
 * List of colors:
 *  https://github.com/Microsoft/monaco-editor/blob/master/test/playground.generated/customizing-the-appearence-exposed-colors.html
 *  https://code.visualstudio.com/docs/getstarted/theme-color-reference
 */
export type Theme = monaco.editor.IStandaloneThemeData;

export const DARK = {
  BG: '#202634',
  BG_SELECTION: '#394050',
  BG_GUTTER: '#262C3A',
};

export const dark: Theme = {
  base: 'vs-dark',
  inherit: true,
  colors: {
    'editor.foreground': '#F8F8F2',
    'editor.background': DARK.BG,
    'editor.selectionBackground': DARK.BG_SELECTION,
    'editor.lineHighlightBackground': DARK.BG_SELECTION,
    'editorCursor.foreground': '#F8F8F0',
    'editorWhitespace.foreground': '#3B3A32',
    'editorIndentGuide.activeBackground': '#9D550F',
    'editor.selectionHighlightBorder': '#222218',

    'editorGutter.background': DARK.BG_GUTTER,

    // 'editorCodeLens.background': DARK.BG,

    // 'scrollbarSlider.activeBackground': '',
    // 'scrollbarSlider.background': '',
    // 'scrollbarSlider.hoverBackground': '',

    'scrollbarSlider.shadow': DARK.BG,
    'scrollbarSlider.background': DARK.BG,
    'scrollbarSlider.activeBackground': DARK.BG_GUTTER,
    'scrollbarSlider.hoverBackground': '#2B313E',
  },
  rules: [
    // {
    //   foreground: '75715e',
    //   token: 'comment',
    // },
    // {
    //   foreground: 'e6db74',
    //   token: 'string',
    // },
    // {
    //   foreground: 'ae81ff',
    //   token: 'constant.numeric',
    // },
    // {
    //   foreground: 'ae81ff',
    //   token: 'constant.language',
    // },
    // {
    //   foreground: 'ae81ff',
    //   token: 'constant.character',
    // },
    // {
    //   foreground: 'ae81ff',
    //   token: 'constant.other',
    // },
    // {
    //   foreground: 'f92672',
    //   token: 'keyword',
    // },
    // {
    //   foreground: 'f92672',
    //   token: 'storage',
    // },
    // {
    //   foreground: '66d9ef',
    //   fontStyle: 'italic',
    //   token: 'storage.type',
    // },
    // {
    //   foreground: 'a6e22e',
    //   fontStyle: 'underline',
    //   token: 'entity.name.class',
    // },
    // {
    //   foreground: 'a6e22e',
    //   fontStyle: 'italic underline',
    //   token: 'entity.other.inherited-class',
    // },
    // {
    //   foreground: 'a6e22e',
    //   token: 'entity.name.function',
    // },
    // {
    //   foreground: 'fd971f',
    //   fontStyle: 'italic',
    //   token: 'variable.parameter',
    // },
    // {
    //   foreground: 'f92672',
    //   token: 'entity.name.tag',
    // },
    // {
    //   foreground: 'a6e22e',
    //   token: 'entity.other.attribute-name',
    // },
    // {
    //   foreground: '66d9ef',
    //   token: 'support.function',
    // },
    // {
    //   foreground: '66d9ef',
    //   token: 'support.constant',
    // },
    // {
    //   foreground: '66d9ef',
    //   fontStyle: 'italic',
    //   token: 'support.type',
    // },
    // {
    //   foreground: '66d9ef',
    //   fontStyle: 'italic',
    //   token: 'support.class',
    // },
    // {
    //   foreground: 'f8f8f0',
    //   background: 'f92672',
    //   token: 'invalid',
    // },
    // {
    //   foreground: 'f8f8f0',
    //   background: 'ae81ff',
    //   token: 'invalid.deprecated',
    // },
    // {
    //   foreground: 'cfcfc2',
    //   token: 'meta.structure.dictionary.json string.quoted.double.json',
    // },
    // {
    //   foreground: '75715e',
    //   token: 'meta.diff',
    // },
    // {
    //   foreground: '75715e',
    //   token: 'meta.diff.header',
    // },
    // {
    //   foreground: 'f92672',
    //   token: 'markup.deleted',
    // },
    // {
    //   foreground: 'a6e22e',
    //   token: 'markup.inserted',
    // },
    // {
    //   foreground: 'e6db74',
    //   token: 'markup.changed',
    // },
    // {
    //   foreground: 'ae81ff',
    //   token: 'constant.numeric.line-number.find-in-files - match',
    // },
    // {
    //   foreground: 'e6db74',
    //   token: 'entity.name.filename.find-in-files',
    // },
  ],
};
