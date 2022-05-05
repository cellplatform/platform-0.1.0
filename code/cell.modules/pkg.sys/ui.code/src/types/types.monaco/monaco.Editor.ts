import { t } from './common';

/**
 * https://microsoft.github.io/monaco-editor/api/modules/monaco.editor.html
 */
export type IMonacoEditor = {
  defineTheme(themeName: string, themeData: IMonacoStandaloneThemeData): void;
  createModel(value: string, language?: string, uri?: t.IMonacoUri): t.IMonacoTextModel;
  getModel(uri: t.IMonacoUri): t.IMonacoTextModel;
  getModels(): t.IMonacoTextModel[];
  setModelLanguage(model: t.IMonacoTextModel, languageId: string): void;
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
