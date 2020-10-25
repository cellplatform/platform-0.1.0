import { Compiler } from '@platform/cell.compiler';

export default () =>
  Compiler.config()
    .namespace('sample.foo')
    .port(3001)
    .entry({ main: './src/test/entry' })
    .expose('./Header', './src/components/Header')
    .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom']))
    .variant('dev', (config) => config.mode('dev'))
    .variant('prod', (config) => config.mode('prod'));
