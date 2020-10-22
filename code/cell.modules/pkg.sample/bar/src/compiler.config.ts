import { Compiler } from '@platform/cell.compiler';

export default () =>
  Compiler.config('bar')
    .scope('sample.bar')
    .port(3002)
    .scope('My Bar Title')
    .entry({ main: './src/test/entry' })
    .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom']))
    .variant('prod', (config) => config.mode('prod'))
    .variant('dev', (config) => config.mode('dev'));
