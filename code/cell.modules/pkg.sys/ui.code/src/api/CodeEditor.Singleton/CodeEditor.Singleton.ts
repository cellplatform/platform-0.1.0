import { t } from '../common';
import { CodeEditorLibs } from './CodeEditor.Libs';
import { CodeEditorLibsController } from './CodeEditor.Libs.Controller';

/**
 * Singleton instance of an initialized Monaco Editor.
 * This is used to programatically manipulate the editor(s).
 *
 * Refs:
 *    - https://microsoft.github.io/monaco-editor/api/index.html
 *
 */

export function CodeEditorSingleton(args: { bus: t.EventBus<any>; monaco: t.IMonaco }) {
  const { bus, monaco } = args;
  const libs = CodeEditorLibs(monaco);
  const singleton = { monaco, libs };
  CodeEditorLibsController(bus, singleton);
  return singleton;
}
