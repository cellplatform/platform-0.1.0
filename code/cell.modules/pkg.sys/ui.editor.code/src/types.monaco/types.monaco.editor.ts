import { t } from './common';

export type IMonacoEditor = {
  defineTheme(themeName: string, themeData: IMonacoStandaloneThemeData): void;
};

export type IMonacoStandaloneThemeData = {
  base: 'vs' | 'vs-dark' | 'hc-black';
  inherit: boolean;
  colors: { [colorId: string]: string };
  encodedTokensColors?: string[];
  rules: t.Object[];
};

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
