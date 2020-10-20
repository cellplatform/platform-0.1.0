import { Compiler } from '@platform/cell.compiler';
export { Compiler };

export default () =>
  Compiler.config('NAME')
    .title('MyTitle')
    .url(3000)
    .entry({ main: './src/test/entry' })
    .shared((e) => e.add(e.dependencies).singleton(['preset.react']))
    .variant('prod', (config) => config.mode('prod'))
    .variant('dev', (config) => config.mode('dev'));
