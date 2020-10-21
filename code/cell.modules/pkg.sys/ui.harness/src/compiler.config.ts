import { Compiler } from '@platform/cell.compiler';

export default () =>
  Compiler.config('SysUiHarness')
    .title('sys.ui.harness')
    .url(3003)
    .entry({ main: './src/test/entry' })

    .shared((e) => e.add(e.dependencies).singleton(['preset.react']))
    .expose('./Host', './src/components/Host')

    .variant('prod', (config) => config.mode('prod'))
    .variant('dev', (config) => config.mode('dev'));