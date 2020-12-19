import { t } from './common';

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
  onDidChangeModelContent(listener: (e: IMonacoModelContentChangedEvent) => void): t.IDisposable;
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

/**
 * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.imodelcontentchange.html
 */
export type IMonacoModelContentChange = {
  range: t.IMonacoRange;
  rangeLength: number;
  rangeOffset: number;
  text: string;
};
