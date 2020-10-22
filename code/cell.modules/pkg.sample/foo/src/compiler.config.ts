import { Compiler } from '@platform/cell.compiler';

export default () =>
  Compiler.config()
    .scope('sample.foo')
    .port(3001)
    .entry({ main: './src/test/entry' })
    .expose('./Header', './src/components/Header')
    .shared((e) => e.add(e.dependencies).singleton(['preset.react']))
    .variant('dev', (config) => config.mode('dev'))
    .variant('prod', (config) => config.mode('prod'));
