import { Compiler, Package } from '@platform/cell.compiler';

export default () =>
  Compiler.config()
    .namespace('sys.runtime.web.ui')
    .version(Package.version)

    .variant('web', (config) =>
      config
        .title('cell')
        .target('web')
        .port(5051)

        .entry('main', './src/entry/main')
        .entry('worker.service', './src/workers/worker.service')
        .entry('worker.web', './src/workers/worker.web')

        .static('static')
        .files((e) => e.redirect(false, '*.worker.js').access('public', '**/*.{png,jpg,svg}'))
        .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom']))

        /**
         * EXPORTS: Development
         */
        .expose('./Dev', './src/Dev.Harness')
        .expose('./DEV_SAMPLE.error (on module load)', './src/exports.sample/ERROR.OnModuleLoad')
        .expose('./DEV_SAMPLE.error (on render)', './src/exports.sample/ERROR.OnRender'),
    );
