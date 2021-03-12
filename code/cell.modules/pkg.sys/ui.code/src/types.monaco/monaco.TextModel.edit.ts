import { t } from './common';

type R = t.IMonacoRange;

/**
 * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.itextmodel.html#pusheditoperations
 */
export type MonacoPushEditOperations = (
  beforeCursorState: t.IMonacoSelection[] | null,
  editOperations: IMonacoIdentifiedSingleEditOperation[],
  cursorStateComputer?: t.IMonacoCursorStateComputer,
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
 * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditoperationbuilder.html
 */
export type IMonacoEditOperationBuilder = {
  addEditOperation(range: R, text: string | null, forceMoveMarkers?: boolean): void;
  addTrackedEditOperation(range: R, text: string | null, forceMoveMarkers?: boolean): void;
  trackSelection(selection: t.IMonacoSelection, trackPreviousOnEmpty?: boolean): string;
};
