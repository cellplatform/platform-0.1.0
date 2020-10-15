import { Compiler } from '@platform/cell.compiler';

export const configure = () => {
  const config = Compiler.config
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

    // .expose('./CodeEditor', './src/components/Editor')

    // .shared((e) => e.singleton(['react', 'react-dom']))

    .rule({ test: /\.ttf$/, use: ['file-loader'] })
    .clone();

  return config;
};
export default configure;
