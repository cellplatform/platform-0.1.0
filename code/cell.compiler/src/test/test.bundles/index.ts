import { TestCompile, Compiler } from '../TestCompile';
export { TestCompile, Compiler };

const ENTRY = './src/test/test.bundles/node.simple';

export const SampleBundles = {
  simpleNode: TestCompile.make(
    'simple',
    Compiler.config('simple')
      .namespace('test')
      .target('node')
      .entry({
        main: `${ENTRY}/main`,
        foo: `${ENTRY}/foo`,
      })
      .declarations(`${ENTRY}/**/*`, 'types.d/main')
      .static('./static')
      .files((config) => config.redirect(false, '**/*.js').access('public', '**/*.png'))
      .expose('./foo', `${ENTRY}/foo`),
  ),
};
