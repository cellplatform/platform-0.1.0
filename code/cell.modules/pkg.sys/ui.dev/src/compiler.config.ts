import { Compiler, Package } from '@platform/cell.compiler';

export default () =>
  Compiler.config()
    .namespace('sys.ui.dev')
    .variant('web', (config) =>
      config
        .port(Package.compiler.port)
        .entry('main', './src/entry/dom')
        .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom']))
        .expose('./Foo', './src/test/Foo'),
    );
