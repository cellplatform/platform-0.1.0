import { Compiler } from '@platform/cell.compiler';

export default () =>
  Compiler.config()
    .namespace('test.node')
    .entry('./src/tests/compiler/node/main')
    .target('node')
    .variant('prod', (config) => config.mode('prod'))
    .variant('dev', (config) => config.mode('dev'));
