import { Compiler, Package } from '@platform/cell.compiler';

export default () =>
  Compiler.config()
    .namespace('sys.ui.harness')
    .variant('web', (config) =>
      config
        .port(Package.compiler.port)
        .entry('./src/test/entry')

        .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom']))
        .expose('./Host', './src/components/Host')
        .expose('./ActionPanel', './src/components/ActionPanel'),
    );
