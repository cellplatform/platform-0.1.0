import { t } from './common';

/**
 * Model State.
 */
export type CodeEditorModel = {
  text: string;
  language: t.CodeEditorLanguage;
  selection: t.CodeEditorSelection;
};
