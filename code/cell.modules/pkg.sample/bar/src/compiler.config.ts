import { Compiler } from '@platform/cell.compiler';
export { Compiler };

export default () =>
  Compiler.config('bar')
    .title('My Bar')
    .url(3000)
    .entry({ main: './src/test/entry' })
    .shared((e) => e.add(e.dependencies).singleton(['preset.web']))
    .variant('prod', (config) => config.lint(false))
    .variant('dev', (config) => null);
