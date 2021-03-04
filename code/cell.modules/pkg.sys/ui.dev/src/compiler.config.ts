import { Compiler, Package } from '@platform/cell.compiler';

export default () =>
  Compiler.config()
    .namespace('sys.ui.dev')
    .variant('web', (config) =>
      config
        .port(Package.compiler.port)
        .entry('./src/entry/main')

        .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom']))

        .expose('./Harness', './src/components/Harness')
        .expose('./ActionPanel', './src/components/ActionPanel')
        .expose('./Host', './src/components/Host')
        .expose('./Foo', './src/test/Foo'),
    );
