import { Compiler } from '@platform/cell.compiler';

export const configure = () =>
  Compiler.config
    .create('ui.editor.code')
    .url(3002)

    .entry('main', './src/index')
    .entry({
      'editor.worker': 'monaco-editor/esm/vs/editor/editor.worker.js',
      'json.worker': 'monaco-editor/esm/vs/language/json/json.worker',
      'css.worker': 'monaco-editor/esm/vs/language/css/css.worker',
      'html.worker': 'monaco-editor/esm/vs/language/html/html.worker',
      'ts.worker': 'monaco-editor/esm/vs/language/typescript/ts.worker',
    })

    // .expose('./Header', './src/components/Header')
    // .expose('./CodeEditor', './src/components/CodeEditor')
    // .shared((e) => e.singleton(['react', 'react-dom']))
    .clone();

export default configure;
