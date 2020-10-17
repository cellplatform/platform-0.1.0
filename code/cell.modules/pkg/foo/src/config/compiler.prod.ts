import { Compiler } from '@platform/cell.compiler';
export { Compiler };

export const configure = () =>
  Compiler.config('foo')
    .url(3001)
    .title('My Foo')
    .entry({ main: './src/test/entry' })
    .expose('./Header', './src/components/Header')
    .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom']))
    .clone();

export default configure;
