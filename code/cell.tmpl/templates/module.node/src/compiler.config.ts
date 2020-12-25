import { Compiler } from '@platform/cell.compiler';

export default () =>
  Compiler.config()
    .namespace('__NAME__')
    .variant('node', (config) =>
      config
        .target('node')
        .entry('./src/main/index')
        .declarations('./src/**/*')
        .shared((e) => e.add(e.dependencies)),
    );
