import { Compiler } from '../..';

export default () =>
  Compiler.config()
    .namespace('test.node')
    .target('node')
    .dir('dist/test')
    .entry('./src/test/compiler/node/main')
    .static('./static')
    .files((config) => config.redirect(false, '**/*.js').access('public', '**/*.png'));
