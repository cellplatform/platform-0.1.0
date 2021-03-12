import { t } from '../../common';
import { CodeEditorLibs } from './CodeEditor.Libs';
import { CodeEditorLibsEventHandlers } from './CodeEditor.Libs.rx.handlers';

/**
 * Singleton instance of an initialized Monaco Editor.
 * This is used to programatically manipulate the editor(s).
 *
 * Refs:
 *    - https://microsoft.github.io/monaco-editor/api/index.html
 *
 */
export const CodeEditorSingleton = {
  create(bus: t.EventBus<any>, monaco: t.IMonaco): t.ICodeEditorSingleton {
    const libs = CodeEditorLibs(monaco);
    const singleton = { monaco, libs };
    CodeEditorLibsEventHandlers(bus, singleton);
    return singleton;
  },
};
