import { t } from './common';

/**
 * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.itextmodel.html#pusheditoperations
 */
export type MonacoPushEditOperations = (
  beforeCursorState: t.IMonacoSelection[] | null,
  editOperations: IMonacoIdentifiedSingleEditOperation[],
  cursorStateComputer?: IMonacoCursorStateComputer,
) => t.IMonacoSelection[] | null;

/**
 * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.iidentifiedsingleeditoperation.html
 */
export type IMonacoIdentifiedSingleEditOperation = {
  forceMoveMarkers?: boolean;
  range: t.IMonacoRange;
  text: string | null;
};

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
