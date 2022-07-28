import { t } from './common';

type Instance = string;

/**
 * Single instance of a monaco Editor.
 */
export type CodeEditorInstance = t.Disposable & {
  readonly isDisposed: boolean;
  readonly id: string; // Editor instance ID.
  readonly instance: t.IMonacoStandaloneCodeEditor;
  readonly singleton: t.ICodeEditorSingleton;
  readonly events: t.CodeEditorInstanceEvents;
  readonly selection: t.CodeEditorSelection;
  text: string;
  language: t.CodeEditorLanguage;
  focus(): void;
  select(selection: t.CodeEditorSelection | null): void;
  action(id: t.MonacoAction): t.CodeEditorAction;
};

/**
 * Position | Selection.
 */
export type CodeEditorPosition = { column: number; line: number };
export type CodeEditorRange = { start: t.CodeEditorPosition; end: t.CodeEditorPosition };
export type CodeEditorSelection = {
  cursor: t.CodeEditorPosition;
  primary: t.CodeEditorRange;
  secondary: t.CodeEditorRange[];
};

/**
 * Status of a single CodeEditor instance.
 */
export type CodeEditorInstanceStatus = {
  id: Instance;
  filename: string;
};
