import { Compiler, Package } from '@platform/cell.compiler';

export default () =>
  Compiler.config()
    .namespace('sys.scratchpad.node')
    .version(Package.version)

    .variant('node', (config) =>
      config
        .target('node')
        .entry('./src/main/index')
        .declarations('./src/**/*')
        .shared((e) => e.add(e.dependencies)),
    );
