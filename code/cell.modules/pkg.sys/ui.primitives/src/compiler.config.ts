import { Compiler } from '@platform/cell.compiler';

export default () =>
  Compiler.config('primitives')
    .port(3005)
    .title('sys.ui.primitives')
    .entry('./src/test/entry')
    .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom']))

    .expose('./Button', './src/components.ref/button/Button')
    .expose('./Switch', './src/components.ref/button/Switch')
    .expose('./image', './src/components.ref/image/image')
    .expose('./Avatar', './src/components.ref/image/Avatar')
    .expose('./Text', './src/components.ref/text/Text')
    .expose('./TextInput', './src/components.ref/text/TextInput')
    .expose('./Tree', './src/components.ref/tree/Tree')
    .expose('./Spinner', './src/components.ref/spinner/Spinner')

    .variant('prod', (config) => config.mode('prod'))
    .variant('dev', (config) => config.mode('dev'));
