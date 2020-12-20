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
};

/**
 * Position | Selection.
 */
export type CodeEditorPosition = { column: number; line: number };
export type CodeEditorRange = { start: t.CodeEditorPosition; end: t.CodeEditorPosition };
export type CodeEditorSelection = {
  position: t.CodeEditorPosition; // Cursor position.
  primary: t.CodeEditorRange;
  secondary: t.CodeEditorRange[];
};
