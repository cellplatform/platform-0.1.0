import { TestCompile, Compiler } from '../TestCompile';
export { TestCompile, Compiler };

export const SampleBundles = {
  nodeSimple: TestCompile.make(
    'node.simple',
    Compiler.config('node')
      .namespace('test')
      .target('node')
      .entry('./src/test/test.bundles/node.simple/main')
      .static('./static')
      .files((config) => config.redirect(false, '**/*.js').access('public', '**/*.png')),
  ),
};
