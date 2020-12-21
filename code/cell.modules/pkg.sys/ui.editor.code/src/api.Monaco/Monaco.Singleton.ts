import { t } from '../common';
import { MonacoSingletonLibs } from './Monaco.SingletonLibs';

/**
 * Singleton instance of an initialized Monaco Editor.
 * This is used to programatically manipulate the editor(s).
 *
 * Refs:
 *    - https://microsoft.github.io/monaco-editor/api/index.html
 *
 */
export const MonacoSingleton = {
  create(monaco: t.IMonaco): t.ICodeEditorSingleton {
    const libs = MonacoSingletonLibs(monaco);
    return { monaco, libs };
  },
};
