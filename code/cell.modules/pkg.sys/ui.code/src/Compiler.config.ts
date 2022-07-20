import { Compiler, Package } from '@platform/cell.compiler';
import { copy } from './node/fs.copy';

export default () =>
  Compiler.config()
    .namespace('sys.ui.code')
    .version(Package.version)

    .variant('web', (config) =>
      config
        .target('web')
        .port(3034)

        .entry('main', './src/entry/main')
        .declarations('./src/types/env.ts', 'inner/env')

        .static('./static')
        .files((e) => e.access('public', '**/*.{png,jpg,svg}'))

        .shared((config) => config.add(config.dependencies).singleton(['react', 'react-dom']))

        .expose('./Dev', './src/entry/Export.Dev.Harness')
        .expose('./App', './src/entry/Export.Sample.App'),
    )

    .beforeCompile(async (e) => {
      await copy.defs();
      await copy.vs();
    });
