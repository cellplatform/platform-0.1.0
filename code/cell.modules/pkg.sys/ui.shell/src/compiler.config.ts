import { Compiler, Package } from '@platform/cell.compiler';

export default () =>
  Compiler.config()
    .port(Package.compiler.port)
    .namespace('sys.ui.shell')
    .entry('./src/test/entry.web')
    .static('./static')
    .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom']))
    .expose('./Dev', './src/test/App')
    .variant('prod', (config) => config.mode('prod'))
    .variant('dev', (config) => config.mode('dev'));
