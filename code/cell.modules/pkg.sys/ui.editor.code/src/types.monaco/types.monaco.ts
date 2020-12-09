import { t } from './common';

/**
 * Working type wrapper around the "Monaco" code-editor.
 * See:
 *    https://microsoft.github.io/monaco-editor/api/index.html
 */
export type IMonaco = {
  editor: t.IMonacoEditor;
  languages: t.IMonacoLanguages;
};

/**
 * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.cancellationtoken.html
 */
export type IMonacoCancellationToken = {
  isCancellationRequested: boolean;
  onCancellationRequested: MonacoOnCancellationRequested;
};

/**
 * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.cancellationtoken.html#iscancellationrequested
 */
export type MonacoOnCancellationRequested = (
  listener: (e: any) => any,
  thisArgs?: any,
  disposables?: t.IDisposable[],
) => t.IDisposable;

/**
 * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.irange.html
 */
export type IMonacoRange = {
  endColumn: number;
  startColumn: number;
  endLineNumber: number;
  startLineNumber: number;
};
