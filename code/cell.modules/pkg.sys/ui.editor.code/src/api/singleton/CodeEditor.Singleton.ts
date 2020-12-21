import { t } from '../../common';
import { CodeEditorLibs } from './CodeEditor.Libs';

/**
 * Singleton instance of an initialized Monaco Editor.
 * This is used to programatically manipulate the editor(s).
 *
 * Refs:
 *    - https://microsoft.github.io/monaco-editor/api/index.html
 *
 */
export const CodeEditorSingleton = {
  create(monaco: t.IMonaco): t.ICodeEditorSingleton {
    const libs = CodeEditorLibs(monaco);
    return { monaco, libs };
  },
};
