import { monaco } from '../common';
import { EditorTheme } from '../types';
import * as themes from '../themes';

type Editor = monaco.editor.IStandaloneCodeEditor;

/**
 * Configures the theme.
 * See:
 *    https://github.com/brijeshb42/monaco-themes
 *    https://github.com/Microsoft/monaco-editor/blob/master/test/playground.generated/customizing-the-appearence-exposed-colors.html
 */
export function configureTheme(theme: EditorTheme) {
  type Theme = monaco.editor.IStandaloneThemeData;
  switch (theme) {
    case 'DARK':
      monaco.editor.defineTheme('monokai', themes.dark as Theme);
      monaco.editor.setTheme('monokai');
      break;
    case 'LIGHT':
      monaco.editor.setTheme('vs-light');
      break;
    default:
      throw new Error(`Theme '${theme}' not supported.`);
  }
}

/**
 * Configures the number of spaces used for tab-indents.
 */
export function configureTabSize(editor: Editor, tabSize: number) {
  const model = editor.getModel();
  if (model) {
    model.updateOptions({ tabSize });
  }
}
