import { t } from '../common';
import { MonacoSingletonLibs } from './MonacoSingletonLibs';

/**
 * Singleton instance of an initialized Monaco Editor.
 * This is used to programatically manipulate the editor(s).
 *
 *    https://microsoft.github.io/monaco-editor/api/index.html
 *
 */
export const MonacoSingleton = {
  create(monaco: t.IMonaco): t.IMonacoSingleton {
    const libs = MonacoSingletonLibs(monaco);
    return { monaco, libs };
  },
};
