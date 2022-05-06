import { Compiler, Package } from '@platform/cell.compiler';
import { copy } from './node/fs.copy';

export default () =>
  Compiler.config()
    .namespace('sys.ui.code')
    .version(Package.version)

    .variant(
      'web',
      (config) =>
        config
          .target('web')
          .port(3034)

          .entry('main', './src/entry/main')
          // .entry('service.worker', './src/workers/service.worker')
          .declarations('./src/types/env.ts', 'inner/env')
          // .declarations('./src/**/*')

          .static('./static')
          .files((e) =>
            e
              .redirect(false, 'static/**')
              .redirect(false, '*.worker.js')
              .access('public', '**/*.{png,jpg,svg}'),
          )

          .shared((config) => config.add(config.dependencies).singleton(['react', 'react-dom']))
          .expose('./Dev', './src/Dev.Harness'),
      // .expose('./CodeEditor', './src/ui/CodeEditor'),
    )

    .beforeCompile(async (e) => {
      await copy.defs();
      await copy.vs();
    });
