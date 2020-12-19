import { t } from './common';

export type D = t.IDisposable;

/**
 * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.istandalonecodeeditor.html
 */
export type IMonacoStandaloneCodeEditor = {
  // Properties.
  getValue(options?: { lineEnding?: string; preserveBOM?: boolean }): string;
  setValue(newValue: string): void;

  // Methods.
  focus(): void;

  // Events.
  onDidChangeModelContent(listener: (e: IMonacoModelContentChangedEvent) => void): D;
  onDidChangeCursorPosition(listener: (e: IMonacoCursorPositionChangedEvent) => void): D;
  onDidChangeCursorSelection(listener: (e: IMonacoCursorSelectionChangedEvent) => void): void;
};

/**
 * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.imodelcontentchangedevent.html
 */
export type IMonacoModelContentChangedEvent = {
  changes: IMonacoModelContentChange[];
  eol: string;
  isFlush: boolean;
  isRedoing: boolean;
  isUndoing: boolean;
  versionId: number;
};
export type IMonacoModelContentChange = {
  range: t.IMonacoRange;
  rangeLength: number;
  rangeOffset: number;
  text: string;
};

/**
 * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.icursorpositionchangedevent.html
 */
export type IMonacoCursorPositionChangedEvent = {
  position: t.IMonacoPosition;
  reason: t.IMonacoCursorChangeReason;
  secondaryPositions: t.IMonacoPosition[];
  source: string;
};

/**
 * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.icursorselectionchangedevent.html
 */
export type IMonacoCursorSelectionChangedEvent = {
  modelVersionId: number;
  oldModelVersionId: number;
  oldSelections: t.IMonacoSelection[];
  reason: t.IMonacoCursorChangeReason;
  secondarySelections: t.IMonacoSelection[];
  selection: t.IMonacoSelection;
  source: string;
};
