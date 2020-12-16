import { t } from './common';

/**
 * https://microsoft.github.io/monaco-editor/api/modules/monaco.editor.html
 */
export type IMonacoEditor = {
  defineTheme(themeName: string, themeData: IMonacoStandaloneThemeData): void;
};

/**
 * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.istandalonethemedata.html
 */
export type IMonacoStandaloneThemeData = {
  base: 'vs' | 'vs-dark' | 'hc-black';
  inherit: boolean;
  colors: { [colorId: string]: string };
  encodedTokensColors?: string[];
  rules: t.IMonacoTokenThemeRule[];
};

/**
 * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.itokenthemerule.html
 */
export type IMonacoTokenThemeRule = {
  token: string;
  background?: string;
  fontStyle?: string;
  foreground?: string;
};

/**
 * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.itextmodel.html
 */
export type IMonacoTextModel = {
  getValue(eol?: IMonacoEndOfLinePreference, preserveBOM?: boolean): string;
  getFullModelRange(): t.IMonacoRange;
};

/**
 * https://microsoft.github.io/monaco-editor/api/enums/monaco.editor.endoflinepreference.html
 */
export type IMonacoEndOfLinePreference = {
  TextDefined: 0;
  LF: 1;
  CRLF: 2;
};

/**
 * https://microsoft.github.io/monaco-editor/api/enums/monaco.editor.endoflinesequence.html
 */
export type IMonacoEndOfLineSequence = {
  LF: 0;
  CRLF: 1;
};
