import { t } from './common';

/**
 * Working type wrapper around the "Monaco" code-editor.
 * See:
 *    https://microsoft.github.io/monaco-editor/api/index.html
 */
export type IMonaco = {
  editor: IMonacoEditor;
  languages: IMonacoLanguages;
};

export type IMonacoEditor = {
  defineTheme(themeName: string, themeData: IMonacoStandaloneThemeData): void;
};

export type IMonacoStandaloneThemeData = {
  base: 'vs' | 'vs-dark' | 'hc-black';
  inherit: boolean;
  colors: { [colorId: string]: string };
  encodedTokensColors?: string[];
  rules: {}[];
};

export type IMonacoLanguages = {
  typescript: IMonacoLanguageTypescript;
};

export type IMonacoLanguageTypescript = {
  typescriptDefaults: IMonacoLanguageServiceDefaults;
  javascriptDefaults: IMonacoLanguageServiceDefaults;
  ScriptTarget: IMonacoScriptTarget;
};

export type IMonacoLanguageServiceDefaults = {
  setCompilerOptions(options: IMonacoCompilerOptions): void;
  addExtraLib(content: string, filePath?: string): t.IDisposable;
};

/**
 * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.languages.typescript.compileroptions.html
 */
export type IMonacoCompilerOptions = {
  noLib: boolean;
  allowNonTsExtensions: boolean;
  target: IMonacoScriptTarget[keyof IMonacoScriptTarget];
};

/**
 * https://microsoft.github.io/monaco-editor/api/enums/monaco.languages.typescript.scripttarget.html
 */
export type IMonacoScriptTarget = {
  ES2015: 2;
  ES2016: 3;
  ES2017: 4;
  ES2018: 5;
  ES2019: 6;
  ES2020: 1;
  ES3: 0;
  ES5: 1;
  ESNext: 99;
  JSON: 100;
  Latest: 'ESNext';
};
