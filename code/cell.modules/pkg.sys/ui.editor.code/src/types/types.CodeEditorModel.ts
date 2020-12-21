import { t } from './common';

export type CodeEditorState = t.IStateObjectWritable<CodeEditorModel>;

/**
 * TODO 🐷
 * Delete if this is not being used.
 */

/**
 * Represents the data model of a single code-editor.
 */
export type CodeEditorModel = {
  filename: string;
  text: string;
  selection: t.CodeEditorSelection;
};
