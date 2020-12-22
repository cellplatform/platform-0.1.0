import { t } from './common';

/**
 * Single instance of a monaco Editor.
 */
export type CodeEditorInstance = {
  readonly id: string; // Editor instance ID.
  readonly instance: t.IMonacoStandaloneCodeEditor;
  readonly events: t.CodeEditorEvents;
  readonly selection: t.CodeEditorSelection;
  text: string;
  focus(): void;
  dispose(): void;
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
