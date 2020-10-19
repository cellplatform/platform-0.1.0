import { Compiler } from '@platform/cell.compiler';
export { Compiler };

export default () =>
  Compiler.config('foo')
    .title('MyFoo')
    .url(3001)
    .entry({ main: './src/test/entry' })
    .expose('./Header', './src/components/Header')
    .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom']))
    .variant('prod', (config) => config.mode('prod'));
