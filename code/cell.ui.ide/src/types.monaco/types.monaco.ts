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
  onCancellationRequested: IMonacoEvent<any>;
};

/**
 * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.ievent.html
 */
export type IMonacoEvent<T> = {};

/**
 * https://microsoft.github.io/monaco-editor/api/classes/monaco.range.html
 */
export type IMonacoRange = {};
