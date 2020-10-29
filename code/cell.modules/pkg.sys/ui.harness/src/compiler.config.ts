import { Compiler, Package } from '@platform/cell.compiler';

export default () =>
  Compiler.config()
    .port(Package.compiler.port)
    .namespace('sys.ui.harness')
    .entry('./src/test/entry')

    .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom']))
    .expose('./Host', './src/components/Host')

    .variant('prod', (config) => config.mode('prod'))
    .variant('dev', (config) => config.mode('dev'));
