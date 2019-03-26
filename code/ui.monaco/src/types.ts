export type ISize = { width: number; height: number };

export type EditorLanguage = 'typescript' | 'javascript' | 'json' | 'yaml';
export type EditorTheme = 'DARK' | 'LIGHT';

/**
 * Configuration settings for the code-editor.
 */
export type IEditorSettings = {
  /**
   * IEditorConstructionOptions
   * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditorconstructionoptions.html
   */
  selectOnLineNumbers: boolean;
  fontSize: number;
  fontFamily: string;
  readOnly: boolean;

  /**
   * ITextModelUpdateOptions
   * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.itextmodelupdateoptions.html
   */
  tabSize: number;

  /**
   * ReactMonacoEditorProps
   */
  language: EditorLanguage;
  theme: EditorTheme;

  /**
   * Language definitions.
   */
  javascriptDefaults: CodeEditorLanguageDefaults;
  typescriptDefaults: CodeEditorLanguageDefaults;
};

/**
 * Defaults for configured languages.
 */
export type CodeEditorLanguageDefaults = {
  types: string[];
};
