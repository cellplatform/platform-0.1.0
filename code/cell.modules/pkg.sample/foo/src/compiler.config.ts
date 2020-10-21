import { Compiler } from '@platform/cell.compiler';
export { Compiler };

export default () =>
  Compiler.config()
    .scope('SampleFoo')
    .title('MyFoo')
    .url(3001)
    .entry({ main: './src/test/entry' })
    .expose('./Header', './src/components/Header')
    .shared((e) => e.add(e.dependencies).singleton(['preset.react']))
    .variant('prod', (config) => config.mode('prod'));
