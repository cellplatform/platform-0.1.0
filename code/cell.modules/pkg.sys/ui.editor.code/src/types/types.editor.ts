import { t } from './common';

export type CodeEditorTheme = 'light' | 'dark' | 'ink';
export type CodeEditorLanguage = 'typesceript';
export type CodeEditorPosition = { column: number; line: number };

/**
 * Single instance of a monaco Editor.
 */
export type CodeEditorInstance = {
  id: string; // Editor instance ID.
  instance: t.IMonacoStandaloneCodeEditor;
  event$: t.Observable<t.CodeEditorEvent>;
  dispose$: t.Observable<void>;
  value: string;
  position: t.CodeEditorPosition;
  focus(): void;
  dispose(): void;
};
