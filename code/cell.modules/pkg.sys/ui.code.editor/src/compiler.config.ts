import { Compiler } from '@platform/cell.compiler';
import { copy } from './node/fs.copy';

export default () =>
  Compiler.config()
    .namespace('sys.ui.code.editor')
    .variant('web', (config) =>
      config
        .target('web')
        .port(3034)

        .entry('main', './src/entry/main')
        // .entry('service.worker', './src/workers/service.worker')
        .declarations('./src/types/env.ts', 'inner/env')
        // .declarations('./src/**/*')

        .static('./static')
        .files((config) => config.redirect(false, 'static/**').redirect(false, '*.worker.js'))

        .shared((config) => config.add(config.dependencies).singleton(['react', 'react-dom']))
        .expose('./Dev', './src/components/Dev')
        .expose('./CodeEditor', './src/components/CodeEditor'),
    )

    .beforeCompile(async (e) => {
      await copy.defs();
      await copy.vs();
    });
