import { TestCompile, Compiler } from '../TestCompile';
export { TestCompile, Compiler };

// NB: Ensure native [node] types are correctly found.
export { resolve } from 'path';

const ENTRY = './src/test/test.bundles/simple.node';

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
      .declarations(`${ENTRY}/**/*`, 'main')
      .static('./static')
      .files((config) => config.redirect(false, '**/*.js').access('public', '**/*.png'))
      .expose('./foo', `${ENTRY}/foo`),
  ),
};
