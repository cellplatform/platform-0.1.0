import { Compiler } from '../..';

export default () =>
  Compiler.config()
    .namespace('test.node')
    .dir('dist/test')
    .entry('./src/test/compiler/node/main')
    .target('node');
