import { t } from './common';

/**
 * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.icursorstatecomputer.html
 */
export type IMonacoCursorStateComputer = (
  inverseEditOperations: IMonacoValidEditOperation[],
) => t.IMonacoSelection[] | null;

/**
 * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ivalideditoperation.html
 */
export type IMonacoValidEditOperation = {
  range: t.IMonacoRange;
  text: string;
};

/**
 * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.icursorstatecomputerdata.html
 */
export type IMonacoCursorStateComputerData = {
  getInverseEditOperations(): t.IMonacoValidEditOperation[];
  getTrackedSelection(id: string): t.IMonacoSelection;
};
