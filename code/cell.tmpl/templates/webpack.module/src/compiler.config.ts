import { Compiler } from '@platform/cell.compiler';

export default () =>
  Compiler.config()
    .port(3000)
    .scope('foo.bar')
    .title('My Title')
    .entry('./src/test/entry')
    .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom']))
    .variant('prod', (config) => config.mode('prod'))
    .variant('dev', (config) => config.mode('dev'));
