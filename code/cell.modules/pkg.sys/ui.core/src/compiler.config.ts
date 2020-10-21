import { Compiler } from '@platform/cell.compiler';

/**
 * TODO 🐷
 * - spinner
 * - object
 * - image
 * - icon
 */

export default () =>
  Compiler.config('SysUiCore')
    .title('sys.ui.core')
    .url(3005)
    .entry({ main: './src/test/entry' })
    .shared((e) => e.add(e.dependencies).singleton(['preset.react']))

    .expose('./Button', './src/components.ref/button/Button')
    .expose('./Switch', './src/components.ref/button/Switch')
    .expose('./image', './src/components.ref/image/image')
    .expose('./Avatar', './src/components.ref/image/Avatar')
    .expose('./Text', './src/components.ref/text/Text')
    .expose('./TextInput', './src/components.ref/text/TextInput')
    .expose('./Tree', './src/components.ref/tree/Tree')

    .variant('prod', (config) => config.mode('prod'))
    .variant('dev', (config) => config.mode('dev'));
