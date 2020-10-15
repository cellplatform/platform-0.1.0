import { Compiler } from '@platform/cell.compiler';

export const configure = () =>
  Compiler.config
    .create('ui.editor.code')
    .url(3002)
    // .title('ui.editor.code')
    .entry('main', './src/index')
    // .expose('./Header', './src/components/Header')
    // .expose('./CodeEditor', './src/components/CodeEditor')
    .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom']))
    .clone();

export default configure;
