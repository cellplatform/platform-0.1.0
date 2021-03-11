import { t } from './common';

type Result = { range: t.IMonacoRange; text: string; eol?: t.IMonacoEndOfLineSequence };

export type IMonacoTextEdit = Result;

/**
 * https://microsoft.github.io/monaco-editor/api/modules/monaco.languages.html#registerdocumentformattingeditprovider
 */
export type MonacoRegisterDocumentFormattingEditProvider = (
  languageId: string,
  provider: t.MonacoDocumentFormattingEditProvider,
) => t.IDisposable;

/**
 * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.languages.documentformattingeditprovider.html#providedocumentformattingedits
 */
export type MonacoDocumentFormattingEditProvider = {
  displayName?: string;
  provideDocumentFormattingEdits(
    model: t.IMonacoTextModel,
    options: IMonacoFormattingOptions,
    token: t.IMonacoCancellationToken,
  ): Promise<IMonacoTextEdit[]>;
};

/**
 * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.languages.documentformattingeditprovider.html#providedocumentformattingedits
 */
export type MonacoProvideDocumentFormattingEdits = (
  model: t.IMonacoTextModel,
  options: IMonacoFormattingOptions,
  token: t.IMonacoCancellationToken,
) => Promise<IMonacoTextEdit[]>;

/**
 * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.languages.formattingoptions.html
 */
export type IMonacoFormattingOptions = {
  insertSpaces: boolean;
  tabSize: number;
};
