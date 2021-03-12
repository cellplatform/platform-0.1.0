import { t } from './common';

/**
 * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.icommand.html
 */
export type IMonacoCommand = {
  computeCursorState(
    model: t.IMonacoTextModel,
    helper: t.IMonacoCursorStateComputerData,
  ): t.IMonacoSelection;

  getEditOperations(model: t.IMonacoTextModel, builder: t.IMonacoEditOperationBuilder): void;
};

/**
 * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditoraction.html
 */
export type IMonacoEditorAction = {
  readonly id: string;
  readonly alias: string;
  readonly label: string;
  isSupported(): boolean;
  run(): Promise<void>;
};
