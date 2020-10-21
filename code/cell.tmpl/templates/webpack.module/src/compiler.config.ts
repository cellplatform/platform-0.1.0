import { Compiler } from '@platform/cell.compiler';

export default () =>
  Compiler.config()
    .scope('MyScope')
    .title('My Title')
    .url(3000)
    .entry({ main: './src/test/entry' })
    .shared((e) => e.add(e.dependencies).singleton(['preset.react']))
    .variant('prod', (config) => config.mode('prod'))
    .variant('dev', (config) => config.mode('dev'));
