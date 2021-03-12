import { t } from './common';

/**
 * Working type wrapper around the "Monaco" code-editor.
 * See:
 *    https://microsoft.github.io/monaco-editor/api/index.html
 */
export type IMonaco = {
  editor: t.IMonacoEditor;
  languages: t.IMonacoLanguages;
  Uri: {
    parse(value: string, strict?: boolean): IMonacoUri;
    isUri(thing: any): boolean;
  };
};

/**
 * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.cancellationtoken.html
 */
export type IMonacoCancellationToken = {
  isCancellationRequested: boolean;
  onCancellationRequested: IMonacoOnCancellationRequested;
};

/**
 * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.cancellationtoken.html#iscancellationrequested
 */
export type IMonacoOnCancellationRequested = (
  listener: (e: any) => any,
  thisArgs?: any,
  disposables?: t.IDisposable[],
) => t.IDisposable;

/**
 * https://microsoft.github.io/monaco-editor/api/classes/monaco.uri.html#parse
 */
export type IMonacoUri = {
  authority: string;
  fragment: string;
  path: string;
  query: string;
  scheme: string;
};
