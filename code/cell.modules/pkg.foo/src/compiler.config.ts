import { Compiler } from '@platform/cell.compiler';
export { Compiler };

export const configure = () =>
  Compiler.config
    .create('foo')
    .url(3001)
    .title('My Foo')
    .entry('main', './src/index')
    .expose('./Header', './src/components/Header')
    .expose('./CodeEditor', './src/components/CodeEditor')
    .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom']))
    .clone();

export default configure;
