import { Compiler } from '@platform/cell.compiler';
export { Compiler };

export default () =>
  Compiler.config('bar')
    .title('My Bar')
    .url(3002)
    .entry({ main: './src/test/entry' })
    .shared((e) => e.add(e.dependencies).singleton(['preset.react']))
    .variant('prod', (config) => config.mode('prod'))
    .variant('dev', (config) => config.mode('dev'));
