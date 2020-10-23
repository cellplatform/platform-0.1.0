import { Compiler } from '@platform/cell.compiler';

export default () =>
  Compiler.config()
    .port(3002)
    .scope('sys.ui.harness')
    .entry('./src/test/entry')

    .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom']))
    .expose('./Host', './src/components/Host')

    .variant('prod', (config) => config.mode('prod'))
    .variant('dev', (config) => config.mode('dev'));
