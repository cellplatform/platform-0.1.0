import { Compiler, Package } from '@platform/cell.compiler';

export default () =>
  Compiler.config()
    .namespace('sys.ui.dev')
    .version(Package.version)

    .variant('web', (config) =>
      config
        .port(3032)
        .entry('main', './src/entry/dom')
        .shared((e) => e.add(e.dependencies).singleton(['sys.ui.react']))
        .expose('./Foo', './src/test/Foo'),
    );
