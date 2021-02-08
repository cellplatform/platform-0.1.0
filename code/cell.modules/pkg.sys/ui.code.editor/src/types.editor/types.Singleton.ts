import { IMonaco } from '../types.monaco';
import { t } from './common';

/**
 * The singleton instance of the Monaco API.
 */
export type ICodeEditorSingleton = {
  readonly monaco: IMonaco;
  readonly libs: t.ICodeEditorLibs;
};
