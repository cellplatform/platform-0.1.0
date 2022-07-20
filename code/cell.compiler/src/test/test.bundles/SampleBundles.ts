import { TestCompile, Compiler } from '../TestCompile';

const ENTRY = {
  NODE: './src/test/test.bundles/simple.node',
  WEB: './src/test/test.bundles/simple.web',
};

export const SampleBundles = {
  simpleNode: TestCompile.make(
    'simple.node',
    Compiler.config('simple.node')
      .namespace('ns.test.node')
      .target('node')
      .entry({
        main: `${ENTRY.NODE}/main`,
        foo: `${ENTRY.NODE}/foo`,
      })
      .declarations(`${ENTRY.NODE}/**/*`, 'main')
      .static('./static')
      .files((config) => config.access('public', '**/*.png')),
  ),

  simpleWeb: TestCompile.make(
    'simple.web',
    Compiler.config('simple.web')
      .namespace('ns.test.web')
      .target('web')
      .port(1234)
      .entry(`${ENTRY.WEB}/entry/main`)
      .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom']))
      .expose('./App', `${ENTRY.WEB}/components/App`)
      .expose('./Foo', `${ENTRY.WEB}/components/Foo`),
  ),
};
